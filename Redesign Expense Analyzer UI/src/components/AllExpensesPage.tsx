import { TransactionPage } from './TransactionPage';

interface AllExpensesPageProps {
  onBack: () => void;
  startDate: string;
  endDate: string;
  source: string;
}

export function AllExpensesPage({ onBack, startDate, endDate, source }: AllExpensesPageProps) {
  return (
    <TransactionPage
      title="All Expenses"
      emoji="📊"
      onBack={onBack}
      startDate={startDate}
      endDate={endDate}
      source={source}
      category="All Expenses"
      showCategoryColumn={true}
    />
  );
}
