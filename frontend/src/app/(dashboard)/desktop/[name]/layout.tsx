import { Metadata } from 'next';
import { PROJECT_NAME } from '@/src/constants';

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  
  return {
    title: `Dashboard / ${decodedName} - ${PROJECT_NAME}`,
  };
}

export default function DesktopProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
