import { redirect } from 'next/navigation';

export default function CompaniesAnnuaireRedirect() {
  // Redirect /companies/annuaire to /annuaire
  redirect('/annuaire');
}
