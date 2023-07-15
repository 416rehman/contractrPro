export default function Page({ params }: { params: { id: string } }) {
  return <div>Expense: {params.id}</div>;
}