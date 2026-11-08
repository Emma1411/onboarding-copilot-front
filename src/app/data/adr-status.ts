import { AdrStatus } from '@interfaces/adr.interface';

export const STATUS_LABEL: Record<AdrStatus, string> = {
  accepted: 'Accepté',
  proposed: 'Proposé',
  rejected: 'Rejeté',
  superseded: 'Remplacé',
};

export const STATUS_ORDER: readonly AdrStatus[] = ['accepted', 'proposed', 'rejected', 'superseded'];