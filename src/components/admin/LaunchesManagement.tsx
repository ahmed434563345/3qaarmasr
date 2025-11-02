import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLaunches, useDeleteLaunch } from '@/hooks/useLaunches';
import AddLaunchModal from './AddLaunchModal';
import LoadingSpinner from '../common/LoadingSpinner';

const LaunchesManagement = () => {
  const { data: launches, isLoading } = useLaunches();
  const deleteLaunch = useDeleteLaunch();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLaunch, setEditingLaunch] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      deleteLaunch.mutate(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Launches Management</CardTitle>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Launch
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Developer Price</TableHead>
                <TableHead>Resale Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {launches?.map((launch) => (
                <TableRow key={launch.id}>
                  <TableCell>
                    {launch.logo_url && (
                      <img
                        src={launch.logo_url}
                        alt={launch.title}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{launch.title}</TableCell>
                  <TableCell>{launch.location}</TableCell>
                  <TableCell>
                    {launch.developer_start_price
                      ? `${launch.developer_start_price.toLocaleString()} EGP`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {launch.resale_start_price
                      ? `${launch.resale_start_price.toLocaleString()} EGP`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingLaunch(launch);
                          setIsAddModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(launch.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddLaunchModal
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setEditingLaunch(null);
        }}
        launch={editingLaunch}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Launch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this launch? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LaunchesManagement;
