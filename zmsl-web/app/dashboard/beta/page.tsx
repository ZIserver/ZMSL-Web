import { Metadata } from 'next';
import BetaClient from './BetaClient';

export const metadata: Metadata = {
  title: '内测申请 - ZMSL',
  description: 'Apply for ZMSL Beta access',
};

export default function BetaPage() {
  return <BetaClient />;
}
