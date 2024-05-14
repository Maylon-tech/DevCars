import { ChangeEvent, useContext, useState } from "react"
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from 'zod'
import { FiTrash, FiUpload } from "react-icons/fi"
import { v4 as uuidV4  } from 'uuid'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject,  
} from 'firebase/storage'
import { addDoc, collection } from 'firebase/firestore'

import { storage, db } from '../../../services/firebaseConnection'
import { Container } from "../../../components/container"
import { DashboardHeader } from "../../../components/panelHeader"
import { Input } from "../../../components/input"
import { AuthContext } from "../../../contexts/AuthContext"
import toast from "react-hot-toast"

// Eschema para cada Input do Form
const schema = z.object({
  name: z.string().nonempty("O campo nome é obrigatório."),
  model: z.string().nonempty("O modelo é obrigatório.",),
  year: z.string().nonempty("O Ano do carro é obrigatório."),
  km: z.string().nonempty("O KM do carro é obrigatório."),
  price: z.string().nonempty("O preço é obrigatório."),
  city: z.string().nonempty("A cidade é obrigatório."),
  whatsapp: z.string().min(1, "O Telefone é obrigatório.").refine((value) => /^(\d{11,12})$/.test(value), {  // REGEX
    message: "Numero de telefone invalido!"
  }),
  description: z.string().nonempty("A descrição é obrigatório.")
})

type FormData = z.infer<typeof schema>

interface ImageItemProps {
  uid: string
  name: string
  previewUrl: string
  url: string
}

export function New() {
  const [carImages, setCarImages] = useState<ImageItemProps[]>([])
  const { user } = useContext(AuthContext)


  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if(e.target.files && e.target.files[0]){
      const image = e.target.files[0]

      if(image.type === 'image/jpeg' || image.type === 'image/png') {
        // Enviar para Storage do DB
        await handleUpload(image)
      } else {
        alert("Envie a imagem no formato jpeg ou png.")
      }
    }
  }

  // Function para salvar imagem no Banco
  async function handleUpload(image: File){
    if(!user?.uid){
      return
    }
    const currentUid = user?.uid
    const uidImage = uuidV4()
    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)

    uploadBytes(uploadRef, image)  // Promise
      .then((snapshot) => {  // parametro snapshot
        getDownloadURL(snapshot.ref).then((downloadUrl) => {
          const imageItem = {
            name: uidImage,
            uid: currentUid,
            previewUrl: URL.createObjectURL(image),
            url: downloadUrl,
          }
          setCarImages((images) => [...images, imageItem])
        })
      })
  }

  function onSubmit(data: FormData) {

    if(carImages.length === 0) {
      alert("Envie alguma imagem deste carro.!")
      toast.error("Envie pelo menos uma imagem.")
      return
    }
    const carListImages = carImages.map( car => {
      return {
        uid: car.uid,
        name: car.name,
        url: car.url
      }
    })

    addDoc(collection(db, "cars"), {
      name: data.name.toUpperCase(),
      model: data.model,
      whatsapp: data.whatsapp,
      city: data.city,
      km: data.km,
      price: data.price,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImages,
    })
      .then(() => {
        reset()
        setCarImages([])
        console.log("Cadastrardoo com sucesso")
        toast.success("Carro cadastrado com sucesso.")
      })
      .catch((error) => {
        console.log(error)
        console.log("ERRO AO CADASTRAR no Banco.")
        toast.error("Erro ao preencher o Formulario!")
      })
  }

  // Delete images
  const handleDeleteImage = async (item: ImageItemProps) => {
    const imagePath = `images/${item.uid}/${item.name}`
    const imageRef = ref(storage, imagePath)
    try {
      deleteObject(imageRef)
      setCarImages(carImages.filter((car) => car.url !== item.url))
    } catch(err){
      console.log("ERRO AO DELETAR!")
    }
  }

  return (
    <Container>
      <DashboardHeader />

      {/* Area de Facer Upload de Imagens */}
      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer">
            <input 
              type="file" 
              accept="image/" 
              className="opacity-0 cursor-pointer"
              onChange={handleFile}
            />
          </div>
        </button>

        {
          carImages.map((item) => (
            <div key={item.name} className="w-full h-32 flex items-center justify-center relative">
              <img 
                className="rounded-lg w-full h-32 object-cover"
                src={item.previewUrl} 
                alt="Foto do carro" 
              />
              <button 
                className="absolute"
                onClick={() => handleDeleteImage(item)}
              >
                <FiTrash size={28} color="#fff" />
              </button>
            </div>
          ))
        }
      </div>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <form 
          className="w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-3">
            <p className="mb-2 font-medium">Nome do carro</p>
            <Input 
              type="text"
              register={register}
              name="name"
              error={errors.name?.message}
              placeholder="Ex: Onix 1.0..."
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Modelo do carro</p>
            <Input
              type="text"
              register={register}
              name="model"
              error={errors.model?.message}
              placeholder="Ex: 1.0 Flex Manual..."
            />
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano</p>
              <Input
                type="text"
                register={register}
                name="year"
                error={errors.year?.message}
                placeholder="Ex: 2018/2018..."
              />
            </div>
            <div className="w-full">
              <p className="mb-2 font-medium">KM</p>
              <Input
                type="text"
                register={register}
                name="km"
                error={errors.km?.message}
                placeholder="Ex: 25.890..."
              />
            </div>
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Telefone / Whatsapp</p>
              <Input
                type="text"
                register={register}
                name="whatsapp"
                error={errors.whatsapp?.message}
                placeholder="Ex: 0810608734..."
              />
            </div>
            <div className="w-full">
              <p className="mb-2 font-medium">Cidade</p>
              <Input
                type="text"
                register={register}
                name="city"
                error={errors.city?.message}
                placeholder="Ex: Campo Grande - MS..."
              />
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Preço</p>
            <Input
              type="text"
              register={register}
              name="price"
              error={errors.price?.message}
              placeholder="Ex: 87.000..."
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Descrição</p>
            <textarea
              className="border-2 w-full rounded-md h-24 px-2"
              {...register("description")}
              name="description"
              id="description"
              placeholder="Digite a descrição completa sobre o carro..."
            >
              {
                errors.description && 
                <p className="mb-1 text-red-500">{errors.description.message}</p>
              }
            </textarea>
          </div>

          <button 
            type="submit"
            className="w-full rounded-md bg-zinc-900 text-white font-medium h-10"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </Container>
  )
}