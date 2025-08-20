import logo from '../assets/logo/logo.png'

const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900">
      <img src={logo} alt="Reco" className="animate-pulse h-10 mb-2" />
      <p className="text-gray-400 text-xs">Loading ...</p>
    </div>
  )
}

export default Loader
