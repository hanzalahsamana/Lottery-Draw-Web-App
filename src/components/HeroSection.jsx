import ModelRenderer from './ModelComponents/ModelRenderer'
import Bingo from '/GameLogos/Bingo.jpg';
import Winner from '/GameLogos/Winner.jpg';
import Lottery from '/GameLogos/Lottery.jpg';

const games = [
    {
        name: 'Bingo',
        subText: 'Card game',
        image: Bingo,
    },
    {
        name: 'Winner',
        subText: 'Who will be?',
        image: Winner,
    },
    {
        name: 'Lottery',
        subText: 'Luck depends',
        image: Lottery,
    },
]

const HeroSection = ({ secondsLeft }) => {
    return (
        <div className=' md:h-112.5  flex items-center md:flex-row flex-col justify-between px-6'>
            <div className='z-20  mt-6'>
                <h1 className='font-bold animteUpDown text-[#FEB906] text-[35px] md:text-[50px]/[70px]'>Millions in prizes,</h1>
                <h1 className='font-bold animteUpDown text-[#ffffff]  text-[35px] md:text-[50px]/[70px]'>Just one ticket away.</h1>
                <button className='bg-linear-to-b animteUpDown from-[#3c049d] to-[#2b0370] text-white px-6 py-3 rounded-md text-sm mt-4'>Winnig For #649HF013242</button>
                <div className='flex animteUpDown flex-col items-start gap-2 mt-8'>
                    <p className='text-white/80 text-sm'>Browse more games</p>
                    <div className='flex items-center gap-4 '>
                        {games?.map((game, i) => (
                            <div key={i} className='bg-[#0b1220] p-1.5 rounded-lg cursor-pointer flex gap-2 items-start'>
                                <img src={game.image} alt="" className='w-12.75 h-11.25 rounded-md' />
                                <div className='flex flex-col gap-1'>
                                    <p className='text-white font-medium text-sm'>{game.name}</p>
                                    <p className='text-white/80 text-xs'>{game.subText}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ModelRenderer secondsLeft={secondsLeft} />
        </div>
    )
}

export default HeroSection