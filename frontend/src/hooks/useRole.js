import { useSelector } from 'react-redux';
import { selectCurrentAdmin } from '@/redux/auth/selectors';

export default function useRole() {
  const currentAdmin = useSelector(selectCurrentAdmin);
  const role = currentAdmin?.role || 'personel';

  return {
    role,
    isOwner: role === 'owner',
    isAdmin: role === 'owner' || role === 'admin',
    isPersonel: role === 'personel',
    canEdit: role === 'owner' || role === 'admin',
    canDelete: role === 'owner' || role === 'admin',
  };
}
