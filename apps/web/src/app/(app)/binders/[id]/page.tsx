import BinderEditorPage from "./BinderEditorPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <BinderEditorPage binderId={id} />;
}
