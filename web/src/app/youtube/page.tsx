import { redirect } from 'next/navigation'

/* YouTube now lives inside the Video section on the home page */
export default function YouTube() {
  redirect('/#video')
}
