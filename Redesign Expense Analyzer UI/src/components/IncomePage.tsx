import { TransactionPage } from './TransactionPage';

interface IncomePageProps {
  onBack: () => void;
  startDate: string;
  endDate: string;
  source: string;
}

export function IncomePage({ onBack, startDate, endDate, source }: IncomePageProps) {
  return (
    <TransactionPage
      title="Income"
      emoji="💰"
      onBack={onBack}
      startDate={startDate}
      endDate={endDate}
      source={source}
      category="Income"
      showCategoryColumn={false}
    />
  );
}
