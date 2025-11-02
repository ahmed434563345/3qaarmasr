import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId } = await req.json();
    console.log('AI Search request:', { query, userId });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    // Call Lovable AI to process the search query
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a real estate search assistant. Parse the user's natural language query and extract:
- Property type (house, apartment, condo, townhouse, land)
- Price range (min and max)
- Number of bedrooms
- Number of bathrooms
- Location (city, state)
- Special features or amenities

Return the extracted information in a structured format with search suggestions.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_search_filters",
            description: "Extract structured search filters from natural language query",
            parameters: {
              type: "object",
              properties: {
                propertyType: {
                  type: "string",
                  enum: ["house", "apartment", "condo", "townhouse", "land"],
                  description: "Type of property"
                },
                minPrice: { type: "number", description: "Minimum price" },
                maxPrice: { type: "number", description: "Maximum price" },
                bedrooms: { type: "number", description: "Number of bedrooms" },
                bathrooms: { type: "number", description: "Number of bathrooms" },
                city: { type: "string", description: "City name" },
                state: { type: "string", description: "State name" },
                amenities: {
                  type: "array",
                  items: { type: "string" },
                  description: "Special features or amenities"
                },
                suggestions: {
                  type: "array",
                  items: { type: "string" },
                  description: "3-5 search suggestions based on the query"
                }
              },
              required: ["suggestions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "extract_search_filters" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData));

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const filters = toolCall?.function?.arguments ? 
      JSON.parse(toolCall.function.arguments) : {};

    // Save search to history if user is authenticated
    if (userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase.from('search_history').insert({
        user_id: userId,
        query,
        filters,
      });
    }

    return new Response(
      JSON.stringify({ filters, query }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-search function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});