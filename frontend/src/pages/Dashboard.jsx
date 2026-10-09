import { Link } from "react-router-dom";
import { Building2, DollarSign, HeartPulse, PawPrint, TrendingUp } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import EmptyState from "../components/ui/EmptyState";
import PopulationChart from "../components/charts/PopulationChart";
import StatusChart from "../components/charts/StatusChart";
import SpeciesChart from "../components/charts/SpeciesChart";
import FinanceChart from "../components/charts/FinanceChart";
import { useAnalytics, useAllLogs } from "../hooks/queries";
import { useAuth } from "../context/AuthContext";
import { EVENT_STYLES } from "../lib/constants";
import { formatDate, formatMoney } from "../lib/format";

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, error } = useAnalytics();
  const { data: recent = [] } = useAllLogs({ limit: 6 });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  const { totals } = data;

  return (
    <>
      <PageHeader title={`Hello, ${user.username}`} subtitle="Here's how your farm looks today." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Building2} label="Structures" value={totals.structures} />
        <StatCard icon={PawPrint} label="Active animals" value={totals.activeAnimals} hint={`${totals.animals} total on record`} />
        <StatCard icon={HeartPulse} label="Needs attention" value={totals.sick} hint="Animals marked sick" tone="text-red-500" />
        <StatCard icon={DollarSign} label="Net, last 12 mo" value={formatMoney(totals.net)} hint={`${formatMoney(totals.revenue)} in · ${formatMoney(totals.expenses)} out`} tone="text-accent" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="p-4 lg:col-span-3">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <TrendingUp className="size-4 text-brand" aria-hidden="true" /> Herd population
          </h2>
          <PopulationChart data={data.populationTrend} />
        </Card>
        <Card className="p-4 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Health status</h2>
          <StatusChart data={data.statusDistribution} />
        </Card>
        <Card className="p-4 lg:col-span-3">
          <h2 className="mb-3 font-semibold">Revenue &amp; expenses</h2>
          <FinanceChart data={data.finance} />
        </Card>
        <Card className="p-4 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Active animals by species</h2>
          <SpeciesChart data={data.speciesDistribution} />
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="border-b border-line px-4 py-3 font-semibold">Recent activity</h2>
        {recent.length === 0 ? (
          <EmptyState title="No activity yet">Log a vet visit, birth or sale from an animal's page.</EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((log) => (
              <li key={log._id} className="flex flex-wrap items-baseline gap-x-3 px-4 py-2.5 text-sm">
                <span className={`font-medium ${EVENT_STYLES[log.eventType]}`}>{log.eventType}</span>
                <Link to={`/animals/${log.animal?._id}`} className="hover:text-brand hover:underline">
                  {log.animal?.name}
                </Link>
                <time className="ml-auto text-xs text-muted">{formatDate(log.date)}</time>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
