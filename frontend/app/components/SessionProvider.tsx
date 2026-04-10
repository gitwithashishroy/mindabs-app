'use client';

import { SessionProvider as Provider } from 'next-auth/react';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  session: any;
}

export default function SessionProvider({ children, session }: Props) {
  return <Provider session={session}>{children}</Provider>;
}
