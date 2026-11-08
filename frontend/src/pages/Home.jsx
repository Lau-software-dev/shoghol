import Button from '../components/Button'

export default function Home() {
  return (
    <section className="overflow-hidden rounded-card border border-line bg-ink text-paper px-6 py-14 sm:px-12 sm:py-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent-300"> Student work, student rates</p>
      <h1 className="mt-5 max-w-3xl font-display text-5xl font-bold leading-[0.98] tracking-[-0.03em] sm:text-6xl"> Somebody on this campus
        <br />
        can already do it.</h1>
      <p className="mt-6 max-w-xl text-base text-paper/65">
        Post what you need, people offer, you pick exactly one. Shoghol keeps the part everyone
        gets wrong — who agreed to what, and when it was done.
      </p>
      <div className="mt-9 flex flex-wrap gap-3"> 
        <Button to="/post" variant="accent">
          Post a Job
        </Button>
        <Button to="/browse" variant="onDark">
          Find work
        </Button>
      </div>
    </section>
  )
}