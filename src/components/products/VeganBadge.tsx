import { assetPath } from '../../data/sladkaFazulkaCatalog';

type VeganBadgeProps = {
  size?: number;
  className?: string;
};

const veganBadgeSrc = assetPath('images/sladka-fazulka/badges/vegan.png');

const VeganBadge = ({ size = 56, className = '' }: VeganBadgeProps) => (
  <img
    src={veganBadgeSrc}
    alt="Vegánsky produkt"
    title="Vegánsky"
    width={size}
    height={size}
    className={`drop-shadow-sm ${className}`}
    style={{ width: size, height: size, objectFit: 'contain' }}
  />
);

export default VeganBadge;
