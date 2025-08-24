import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to chat as the primary interface
  redirect('/chat');
}
