import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getDoc, doc } from "firebase/firestore"
import { Swiper, SwiperSlide } from 'swiper/react'

import { db } from "../../services/firebaseConnection"
import { Container } from "../../components/container"
import { FaWhatsapp } from "react-icons/fa"


interface CarProps {
  id: string
  name: string
  year: string
  uid: string
  price: string | number
  city: string
  model: string
  km: string
  whatsapp: string
  created: string
  owner: string
  description: string
  images: ImageCarProps[]
}

interface ImageCarProps {
  name: string
  uid: string
  url: string
}

export function CarDetail() {
  const [car, setCar] = useState<CarProps>()
  const [sliderPerView, setSliderPerView] = useState<number>(2)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    async function loadCar() {
      if(!id) { return }

      const docRef = doc(db, "cars", id)
      getDoc(docRef)
        .then((snapshot) => {

          if(!snapshot.data()) {
            navigate("/")
          }

          setCar({
            id: snapshot.id,
            name: snapshot.data()?.name,
            year: snapshot.data()?.year,
            city: snapshot.data()?.city,
            model: snapshot.data()?.model,
            uid: snapshot.data()?.uid,
            description: snapshot.data()?.description,
            created: snapshot.data()?.created,
            whatsapp: snapshot.data()?.whatsapp,
            price: snapshot.data()?.price,
            km: snapshot.data()?.km,
            owner: snapshot.data()?.owner,
            images: snapshot.data()?.images,
          })
        })
    }
    loadCar()
  }, [id])

  useEffect(() => {
    function handleResize() {
      if(window.innerWidth < 720) {
        setSliderPerView(1)
      } else {
        setSliderPerView(2)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <Container>
      {/* So renderiza se tiver carro na useState */}
      {
        car && (
          <Swiper
            slidesPerView={sliderPerView}
            pagination={{ clickable: true }}
            navigation
          >
            {
              car?.images.map((image) => (
                <SwiperSlide key={image.name}>
                  <img
                    className="w-full h-96 object-cover"
                    src={image.url}
                    alt="car picture"
                  />
                </SwiperSlide>
              ))
            }
          </Swiper>
        )
      }

      {
        car && (
          <main className="w-full bg-white rounded-lg p-6 my-4">
            <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
              <h1 className="font-bold text-3xl text-black">{car?.name}</h1>
              <h1 className="font-bold text-3xl text-black">R$ {car?.price}</h1>
            </div>

            <p className="">{car?.model}</p>

            <div className="flex w-full gap-6 my-4">
              <div className="flex flex-col gap-4">
                <div className="">
                  <p>Cidade</p>
                  <strong>{car?.city}</strong>
                </div>
                <div className="">
                  <p>Ano</p>
                  <strong>{car?.year}</strong>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="">
                  <p>Km</p>
                  <strong>{car?.km}</strong>
                </div>
                
              </div>
            </div>

            <strong>Description</strong>
            <p className="mb-4">{car?.description}</p>

            <strong>Telephone / Whatsapp</strong>
            <p className="">{car?.whatsapp}</p>

            <a 
              href={`https://api.whatsapp.com/send?phone=${car?.whatsapp}&text=Ola vi esse ${car?.name} no site webcars.com e fiquei interessado!`}
              target="_blank" 
              className="bg-green-500 w-full text-white flex items-center justify-center 
              gap-2 my-6 h-11 rounded-lg text-xl font-medium cursor-pointer"
            >
              Conversar com o vendedor
              <FaWhatsapp size={26} color="#fff" />
            </a>
          </main>
        )
      }

    </Container>
  )
}