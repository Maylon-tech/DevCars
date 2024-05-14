
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'

import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../../services/firebaseConnection'


import LogoImg from '../../assets/logo.svg'
import { Container } from "../../components/container"
import { Input } from '../../components/input'

import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email("insira um email valido").nonempty("O campo email e obrigatorio."),
  password: z.string().nonempty("O campo senha e obrigatorio.!!")

})

// Tipagem apra formulario seguir
type FormData = z.infer<typeof schema>

export function Login() {
  const navigate = useNavigate()

  // Function para deslogar
  useEffect(() => {
    async function handleLogOut() {
      await signOut(auth)
    }

    handleLogOut()
  }, [])

  const { register, handleSubmit, formState: { errors }} = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

  const onSubmit = (data: FormData) => {
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then((user) => {
        console.log("Logado com sucesso.!")
        console.log(user)
        toast.success("Logado com sucesso.!")
        navigate("/dashboard", { replace: true })
      })
      .catch((error) => {
        console.log("ERRO ao logar..!!")
        console.log(error)
        toast.error("Erro ao fazer Login.!")
      })



    console.log(data)
  }

  return (
    <Container>
      <div className="w-full min-h-screen flex justify-center items-center flex-col gap-4">
        <Link to="/" className='mb-6 max-w-sm w-full'>
          <img 
            src={LogoImg} 
            alt="Logo do site" 
            className="w-full" />
        </Link>

        <form 
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white max-w-xl w-full rounded-lg p-4"
        >
          <div className="mb-3">
            <Input
              type="email"
              placeholder="Digite seu Email"
              name="email"
              error={errors.email?.message}
              register={register}
            />
          </div>
          <div className="mb-3">
            <Input
              type="password"
              placeholder="Digite seu Senha"
              name="password"
              error={errors.password?.message}
              register={register}
            />
          </div>

          <button 
            className='bg-zinc-900 w-full rounded-md text-white h-10 font-medium' type='submit'
          >
            Acessar
          </button>
        </form>

        <Link to="/register">
          Ainda nao possui uma conta? 
          <span className="text-zinc-800 text-md px-2 font-medium">Cadastre-se!</span>
        </Link>
      </div>
    </Container>
  )
}