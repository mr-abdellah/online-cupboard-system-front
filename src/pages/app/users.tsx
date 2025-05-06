"use client";

import type React from "react";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/services/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiUserX,
  FiUserCheck,
  FiFilter,
} from "react-icons/fi";
import { User } from "@/services/user";
import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { UpdateUserDialog } from "@/components/users/update-user-dialog";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { ActivateUserDialog } from "@/components/users/activate-user-dialog";
import { DeactivateUserDialog } from "@/components/users/deactivate-user-dialog";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Dialogs state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users data
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", page, perPage, debouncedSearchQuery, statusFilter],
    queryFn: () =>
      getUsers(page, perPage, debouncedSearchQuery, statusFilter || undefined),
  });

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);

    // Debounce search query
    clearTimeout(Number(localStorage.getItem("searchTimeout")));
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(e.target.value);
      setPage(1); // Reset to first page on new search
    }, 500);
    localStorage.setItem("searchTimeout", timeout.toString());
  };

  // Handle per page change
  const handlePerPageChange = (value: string) => {
    setPerPage(Number.parseInt(value));
    setPage(1); // Reset to first page when changing items per page
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? "" : value);
    setPage(1); // Reset to first page when changing filter
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Open dialog with selected user
  const openUpdateDialog = (user: User) => {
    setSelectedUser(user);
    setUpdateDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const openActivateDialog = (user: User) => {
    setSelectedUser(user);
    setActivateDialogOpen(true);
  };

  const openDeactivateDialog = (user: User) => {
    setSelectedUser(user);
    setDeactivateDialogOpen(true);
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    if (!data) return null;

    const items = [];
    const totalPages = data.last_page;
    const currentPage = data.current_page;

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => setPage(currentPage > 1 ? currentPage - 1 : 1)}
          className={
            currentPage <= 1
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
    );

    // First page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink isActive={currentPage === 1} onClick={() => setPage(1)}>
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => setPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Last page if not the first page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => setPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() =>
            setPage(currentPage < totalPages ? currentPage + 1 : totalPages)
          }
          className={
            currentPage >= totalPages
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
    );

    return items;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gérez les utilisateurs de votre application
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center"
        >
          <FiPlus className="mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-9 pr-4 py-2 w-full"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <div className="flex items-center">
                    <FiFilter className="mr-2 h-4 w-4" />
                    <span>
                      {statusFilter
                        ? statusFilter === "active"
                          ? "Actif"
                          : "Inactif"
                        : "Tous les statuts"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Afficher:</span>
              <Select
                value={perPage.toString()}
                onValueChange={handlePerPageChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement des utilisateurs...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">
            Une erreur est survenue lors du chargement des utilisateurs.
          </div>
        ) : data?.data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun utilisateur trouvé.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage
                              src={user.avatar || ""}
                              alt={user.name}
                            />
                            <AvatarFallback>
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "active" ? "default" : "destructive"
                          }
                          className={
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-400 "
                          }
                        >
                          {user.status === "active" ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <FiMoreVertical />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openUpdateDialog(user)}
                            >
                              <FiEdit className="mr-2 h-4 w-4" />
                              <span>Modifier</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() => openDeactivateDialog(user)}
                              >
                                <FiUserX className="mr-2 h-4 w-4" />
                                <span>Désactiver</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => openActivateDialog(user)}
                              >
                                <FiUserCheck className="mr-2 h-4 w-4" />
                                <span>Activer</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(user)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <FiTrash2 className="mr-2 h-4 w-4" />
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Affichage de {data?.data.length} sur {data?.total}{" "}
                  utilisateurs ({perPage} par page)
                </div>
                <Pagination>
                  <PaginationContent>
                    {renderPaginationItems()}
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Dialogs */}
      <CreateUserDialog open={createDialogOpen} setOpen={setCreateDialogOpen} />

      {selectedUser && (
        <>
          <UpdateUserDialog
            open={updateDialogOpen}
            setOpen={setUpdateDialogOpen}
            user={selectedUser}
          />
          <DeleteUserDialog
            open={deleteDialogOpen}
            setOpen={setDeleteDialogOpen}
            user={selectedUser}
          />
          <ActivateUserDialog
            open={activateDialogOpen}
            setOpen={setActivateDialogOpen}
            user={selectedUser}
          />
          <DeactivateUserDialog
            open={deactivateDialogOpen}
            setOpen={setDeactivateDialogOpen}
            user={selectedUser}
          />
        </>
      )}
    </div>
  );
}
