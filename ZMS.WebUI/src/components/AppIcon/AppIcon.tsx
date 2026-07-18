import {
  Bell,
  CircleHelp,
  CloudUpload,
  Download,
  ExternalLink,
  FlaskConical,
  Folder,
  FolderUp,
  LayoutDashboard,
  Link,
  LockKeyhole,
  Mail,
  MoveRight,
  Network,
  Plus,
  Search,
  Server,
  SlidersHorizontal,
  UserRound,
  Wrench,
  X,
  Zap,
  type LucideIcon
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  account_circle: UserRound,
  add: Plus,
  bolt: Zap,
  cloud_upload: CloudUpload,
  close: X,
  dns: Server,
  download: Download,
  drive_folder_upload: FolderUp,
  folder: Folder,
  help: CircleHelp,
  hub: Network,
  link: Link,
  lock: LockKeyhole,
  mail: Mail,
  moving: MoveRight,
  notifications: Bell,
  open_in_new: ExternalLink,
  science: FlaskConical,
  search: Search,
  space_dashboard: LayoutDashboard,
  troubleshoot: Wrench,
  tune: SlidersHorizontal
};

interface AppIconProps {
  name: string;
  size?: number;
  className?: string;
  label?: string;
}

export default function AppIcon({ name, size = 20, className = "", label }: AppIconProps): JSX.Element {
  const Icon = icons[name] ?? CircleHelp;

  return (
    <Icon
      className={`app-icon ${className}`.trim()}
      width={size}
      height={size}
      strokeWidth={2}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    />
  );
}
