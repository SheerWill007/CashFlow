import { Icon, type IconName } from '../ui/Icon';

export interface MiniRowProps {
  icon: IconName;
  color: string;
  name: string;
  amount: string;
  share?: number;
}

export function MiniRow({ icon, color, name, amount, share }: MiniRowProps) {
  return (
    <div className="mini-row">
      <span className="ico" style={{ background: color }}>
        <Icon name={icon} size={15} />
      </span>
      <span className="grow">
        {name}
        {share !== undefined && (
          <span className="bar">
            <i style={{ width: `${share}%` }} />
          </span>
        )}
      </span>
      <span className="amt">{amount}</span>
    </div>
  );
}
