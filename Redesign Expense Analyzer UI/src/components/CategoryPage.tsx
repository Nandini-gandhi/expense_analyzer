import { TransactionPage } from './TransactionPage';

interface CategoryPageProps {
  category: string;
  emoji: string;
  color: string;
  onBack: () => void;
  startDate: string;
  endDate: string;
  source: string;
}

export function CategoryPage({ category, emoji, color, onBack, startDate, endDate, source }: CategoryPageProps) {
  return (
    <TransactionPage
      title={category}
      emoji={emoji}
      onBack={onBack}
      startDate={startDate}
      endDate={endDate}
      source={source}
      category={category}
      showCategoryColumn={false}
    />
  );
}