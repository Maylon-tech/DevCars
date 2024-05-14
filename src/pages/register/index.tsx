import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

import {
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth'

import LogoImg from '../../assets/logo.svg'
import { Container } from "../../components/container"
import { Input } from '../../components/input'
import { auth } from '../../services/firebaseConnection'
import { useContext, useEffect } from 'react'
import { AuthContext } from '../../contexts/AuthContext'

const schema = z.object({
  name: z.string().nonempty("O campo nome e obrigatorio"),
  email: z.string().email("insira um email valido").nonempty("O campo email e obrigatorio."),
  password: z.string().min(6, "A senha deve ter pelo meno 6 caracteres.").nonempty("O campo senha e obrigatorio.!!")

})

// Tipagem apra formulario seguir
type FormData = z.infer<typeof schema>

export function Register() {
  const navigate = useNavigate()
  const { handleInfoUser } = useContext(AuthContext)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

  // Function para Deslogar
  useEffect(() => {
    async function handleLogOut() {
      await signOut(auth)
    }

    handleLogOut()
  }, [])

  const onSubmit = async (data: FormData) => {
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then(async(user) => {
        await updateProfile(user.user, {
          displayName: data.name
        })
        
        handleInfoUser({
          name: data.name,
          email: data.email,
          uid: user.user.uid
        })

        console.log("Cadastrado com Sucesso.")
        toast.success("Bem-Vindo ao webcars.!")
        navigate("/dashboard", { replace: true })
      })
      .catch((error) => {
        console.log("ERRO ao cadastrar este usuario..!!")
        console.log(error)
        toast.error("Erro ao finalizar o cadastro.!")
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
              type="text"
              placeholder="Digite seu Nome Completo"
              name="name"
              error={errors.name?.message}
              register={register}
            />
          </div>

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
            Cadastrar
          </button>
        </form>

        <Link to="/login"> 
          Ja possui uma conta? 
          <span className="text-zinc-800 text-md px-2 font-medium">Faca o login!</span>
        </Link>
      </div>
    </Container>
  )
}