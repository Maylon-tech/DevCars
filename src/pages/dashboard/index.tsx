import { useContext, useEffect, useState } from "react"
import { FiTrash2 } from "react-icons/fi"
import { collection, getDocs, where, query, doc, deleteDoc } from "firebase/firestore"
import { ref, deleteObject } from "firebase/storage"
import toast from "react-hot-toast"

import { Container } from "../../components/container"
import { DashboardHeader } from "../../components/panelHeader"
import { db, storage } from "../../services/firebaseConnection"
import { AuthContext } from "../../contexts/AuthContext"
import { Link } from "react-router-dom"

interface CarsProps {
  id: string
  name: string
  year: string
  uid: string
  price: string | number
  city: string
  km: string
  images: CarImageProps[]
}

interface CarImageProps {
  name: string
  uid: string
  url: string
}

export function Dashboard() {
  const [cars, setCars] = useState<CarsProps[]>([])
  //const [] = useState()
  const { user } = useContext(AuthContext)

    // Busca os carros apenas do Usuario Logado..Carro cadastrado do unico dono.
  useEffect(() => {
    function loadCars() {
        // Se nao buscar o ID do carro,
      if(!user?.uid) {
        return
      }
      const carsRef = collection(db, "cars") // busca dentro da collection "cars"
      const queryRef = query(carsRef, where("uid", "==", user.uid))

      getDocs(queryRef)
        .then((snapshot) => {
          let listCars = [] as CarsProps[]

          snapshot.forEach((doc) => {
            listCars.push({
              id: doc.id,
              name: doc.data().name,
              year: doc.data().year,
              km: doc.data().km,
              city: doc.data().city,
              price: doc.data().price,
              images: doc.data().images,
              uid: doc.data().uid
            })
          })
          setCars(listCars)
          console.log(listCars)
        })
    }
    loadCars()
  }, [user])

  // Deletar Car - do Banco, da storage e no UseState
  async function handleDeleteCars(car: CarsProps) {
    let itemCar = car

    const docRef = doc(db, "cars", itemCar.id)  // Identifica o arquivo no Banco
    await deleteDoc(docRef)  // Deleta do Banco
    
    itemCar.images.map( async (image) => {
      const imagePath = `images/${image.uid}/${image.name}`
      const imageRef = ref(storage, imagePath)
      try {
        await deleteObject(imageRef)   // Deleta no Storage
        setCars(cars.filter(car => car.id !== car.id))  // Logica para filtrar o arquivo e jogar na funcao
        toast.success("Carro Deletado com Sucesso!")
      }catch(err){
        console.log("Erro ao excluir essa imagem.!")
        toast.error("Não foi possível deletar!")
      }
    })
  }

  return (
    <Container>
      <DashboardHeader />

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {
          cars.map((car) => (
            <Link key={car.id} to="/">
              <section className="w-full bg-white rounded-lg relative">

                <button
                  onClick={() => handleDeleteCars(car)}
                  className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow"
                >
                  <FiTrash2 size={26} color="#000" />
                </button>

                <img
                  src={car.images[0].url}
                  alt="car image"
                  className="w-full rounded-lg mb-2 max-h-70"
                />
                <p className="font-bold mt-1 px-2 mb-2">{car.name}</p>
                <div className="flex flex-col px-2">
                  <span className="text-zinc-700">
                    Ano {car.year} |  {car.km} km
                  </span>
                  <strong className="text-black font-bold mt-4">
                    R$ {car.price}
                  </strong>
                </div>

                <div className="w-full h-px bg-slate-200 my-2"></div>

                <div className="px-2 pb-2">
                  <span className="text-black">
                    {car.city}
                  </span>
                </div>
              </section>
            </Link>
          ))
        }

      </main>
    </Container>
  )
}
