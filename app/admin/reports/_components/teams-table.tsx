"use client";

import { useState, useMemo } from "react";
import { TeamReportData } from "../actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { exportToExcel, formatDateForExport, formatCurrencyForExport, type ExportColumn } from "@/lib/export-utils";

interface TeamsTableProps {
  teams: TeamReportData[];
}

type SortField = keyof TeamReportData;
type SortDirection = "asc" | "desc" | null;

export function TeamsTable({ teams }: TeamsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Get unique categories, statuses, and years for filters
  const categories = useMemo(
    () => [...new Set(teams.map((team) => team.eventCategory))],
    [teams]
  );
  const statuses = useMemo(
    () => [...new Set(teams.map((team) => team.paymentStatus))],
    [teams]
  );
  const years = useMemo(
    () => [...new Set(teams.map((team) => new Date(team.createdAt).getFullYear()))].sort((a, b) => b - a),
    [teams]
  );

  // Filter and sort data
  const filteredAndSortedTeams = useMemo(() => {
    let filtered = teams.filter((team) => {
      const matchesSearch =
        team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.leaderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.membersList && team.membersList.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || team.paymentStatus === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || team.eventCategory === categoryFilter;

      const matchesYear =
        yearFilter === "all" || new Date(team.createdAt).getFullYear().toString() === yearFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesYear;
    });

    if (sortDirection && sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [teams, searchTerm, statusFilter, categoryFilter, yearFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc"
      );
      if (sortDirection === "desc") {
        setSortField("createdAt");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === "asc") return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === "desc") return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const handleExport = () => {
    const exportColumns: ExportColumn<TeamReportData>[] = [
      { key: 'teamName', header: 'Team Name' },
      { key: 'eventTitle', header: 'Event' },
      { key: 'eventCategory', header: 'Category' },
      { key: 'leaderName', header: 'Team Leader' },
      { key: 'leaderEmail', header: 'Leader Email' },
      { key: 'memberCount', header: 'Total Members' },
      { key: 'membersList', header: 'Team Members' },
      { key: 'totalAmount', header: 'Amount', formatter: formatCurrencyForExport },
      { key: 'paymentStatus', header: 'Payment Status', formatter: (status) => status.replace('_', ' ') },
      { key: 'createdAt', header: 'Created Date', formatter: formatDateForExport },
      { key: 'updatedAt', header: 'Updated Date', formatter: formatDateForExport },
    ];

    const filename = `teams-report-${new Date().toISOString().split('T')[0]}`;
    exportToExcel(filteredAndSortedTeams, exportColumns, filename, 'Teams Report');
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      CONFIRMED: "bg-green-100 text-green-800",
      PAYMENT_SUBMITTED: "bg-yellow-100 text-yellow-800",
      PENDING_PAYMENT: "bg-orange-100 text-orange-800",
      REGISTERED: "bg-blue-100 text-blue-800",
      CANCELLED: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        variant="secondary"
        className={statusColors[status] || "bg-gray-100 text-gray-800"}
      >
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams, events, or leaders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedTeams.length} of {teams.length} teams
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("teamName")}
                  className="h-auto p-0 font-semibold"
                >
                  Team Name
                  {getSortIcon("teamName")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("eventTitle")}
                  className="h-auto p-0 font-semibold"
                >
                  Event
                  {getSortIcon("eventTitle")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("eventCategory")}
                  className="h-auto p-0 font-semibold"
                >
                  Category
                  {getSortIcon("eventCategory")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("leaderName")}
                  className="h-auto p-0 font-semibold"
                >
                  Team Leader
                  {getSortIcon("leaderName")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("memberCount")}
                  className="h-auto p-0 font-semibold"
                >
                  Total Members
                  {getSortIcon("memberCount")}
                </Button>
              </TableHead>
              <TableHead>Team Members</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("totalAmount")}
                  className="h-auto p-0 font-semibold"
                >
                  Amount
                  {getSortIcon("totalAmount")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("paymentStatus")}
                  className="h-auto p-0 font-semibold"
                >
                  Status
                  {getSortIcon("paymentStatus")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("createdAt")}
                  className="h-auto p-0 font-semibold"
                >
                  Created
                  {getSortIcon("createdAt")}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTeams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{team.teamName}</TableCell>
                <TableCell>{team.eventTitle}</TableCell>
                <TableCell>{team.eventCategory}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{team.leaderName}</div>
                    <div className="text-sm text-muted-foreground">
                      {team.leaderEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{team.memberCount}</TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <div className="text-sm">
                      {team.membersList || 'No additional members'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>₹{team.totalAmount.toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(team.paymentStatus)}</TableCell>
                <TableCell>
                  {new Date(team.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredAndSortedTeams.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No teams found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}