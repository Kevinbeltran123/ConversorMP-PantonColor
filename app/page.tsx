import { redirect } from 'next/navigation'
import { getUser } from '@/application/use-cases/auth.actions'

export default async function HomePage() {
  const user = await getUser()

  if (user) {
    redirect('/colors')
  } else {
    redirect('/login')
  }
}
