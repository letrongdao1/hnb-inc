import EvirdActionBar from "@/components/hnb-evird/folder/action-bar";

export default function EvirdFolderContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full space-y-4 overflow-x-hidden p-2">
      <EvirdActionBar />

      {children}
    </div>
  );
}
