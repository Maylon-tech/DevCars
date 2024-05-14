import { signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth } from "../../services/firebaseConnection";

export function DashboardHeader() {

  async function handleLogout() {
    await signOut(auth)
  }

  return (
    <div className="w-full items-center flex h-9 bg-red-500 rounded-lg text-white font-medium gap-4 px-4">
      <Link to="/dashboard">
        Dashboard
      </Link>
      <Link to="/dashboard/new">
        Cadastrar carro
      </Link>

      <button onClick={handleLogout} className="ml-auto">
        Sair da conta
      </button>
    </div>
  )
}