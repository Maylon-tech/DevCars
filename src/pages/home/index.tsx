import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Container } from "../../components/container"
import { db} from '../../services/firebaseConnection'
import {
  collection,
  query,
  getDocs,
  orderBy,
  where
} from 'firebase/firestore'

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

const Home = () => {
  const [cars, setCars] = useState<CarsProps[]>([])
  const [loadImages, setLoadImages] = useState<string[]>([])
  const [input, setInput] = useState("")

  function loadCars() {
    const carsRef = collection(db, "cars")
    const queryRef = query(carsRef, orderBy("created", "desc"))

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
      })
  }

  useEffect(() => {
    loadCars()
  }, [])

  function handleImageLoad(id: string) {
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id])
  }

  // Campo de Busca 
  const handleSearchCar = async () => {
    if(input === ""){
      loadCars()  // SE clicar no campo vazio ira buscar os carros novamente.
      return
    }

      // Limpando os Arrays...
    setCars([])
    setLoadImages([])

    const queryCar = query(collection(db, "cars"),
      where("name", ">=", input.toUpperCase()),
      where("name", "<=", input.toUpperCase() + "\uf8ff")   // Unicode garante incluir todos os caracteres na Busca.
    )

    const querySnapshot = await getDocs(queryCar)
    let listCars = [] as CarsProps[]
    querySnapshot.forEach((doc) => {
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
  }

  return (
    <Container>
      <section className="flex bg-white rounded-lg p-4 w-full max-w-3xl mx-auto gap-2 items-center justify-center">
        <input 
          type="text" 
          placeholder="Digite o nome do carro...."
          className="w-full border-2 rounded-lg h-9 px-3 outline-none" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-red-500 h-9 px-8 text-white font-medium text-lg rounded-md"
          onClick={handleSearchCar}
        >
          Buscar
        </button>
      </section>

      <h1 className="font-bold text-center mt-6 text-2xl mb-4">
        Carros novos e usados em todo o Brasil
      </h1>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {
          cars.map( (car) => (
            <Link key={car.id} to={`/car/${car.id}`}>
              <section className="w-full bg-white rounded-lg">
                <div 
                  className="w-full h-72 rounded-lg bg-slate-200"
                  style={{ display: loadImages.includes(car.id) ? "none" : "block" }}
                ></div>
                <img
                  src={car.images[0].url}
                  alt={car.name}
                  className="w-full rounded-lg mb-2 max-h-72 hover:scale-105 transition-all"
                  onLoad={() => handleImageLoad(car.id)}
                  style={{ display: loadImages.includes(car.id) ? "block" : "none" }}
                />
                <p className="font-bold mt-1 mb-2 px-2">{car.name}</p>
                <div className="flex flex-col px-2">
                  <span className="text-zinc-700 mb-6">Ano {car.year} | {car.km} km</span>
                  <strong className="text-black font-medium text-xl">R$ {car.price}</strong>
                </div>

                <div className="w-full h-px bg-slate-200 my-2"></div>

                <div className="px-2 pb-2">
                  <span className="text-zinc-700">
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

export default Home