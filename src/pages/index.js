import clsx from 'clsx'
import differenceInWeeks from 'date-fns/differenceInWeeks'
import parseDate from 'date-fns/parse'

const WEEKS_IN_ONE_YEAR = Array.from({ length: 52 })

const LIFE_IN_YEARS = Array.from({ length: 100 })

function getNthByStep(i, step) {
  const nth = i + 1

  if (i === 0 || nth % step === 0) {
    return nth
  }

  return null
}

function Cell({ borderfull, colorfull, className, ...props }) {
  return (
    <span
      className={clsx(
        className,
        'flex items-center justify-center w-4 h-4 text-gray-300',
        {
          'border border-gray-400  rounded-sm': borderfull,
          'bg-green-300': colorfull,
          'bg-gray-600': borderfull && !colorfull,
        }
      )}
      {...props}
    />
  )
}

export default function IndexPage({ weeks }) {
  return (
    <div className="max-w-7xl ml-auto mr-auto">
      <header className="flex justify-center items-center py-8 text-4xl">
        <h1 className="text-gray-300">MY LIFE IN WEEKS</h1>
      </header>
      <div className="flex p-4">
        <div className="flex flex-col mr-2 pt-6">
          {LIFE_IN_YEARS.map((_, i) => (
            <Cell
              key={`years-${i}`}
              className={clsx('mb-1 text-right', {
                'mb-4': (i + 1) % 10 === 0,
              })}
            >
              {getNthByStep(i, 5)}
            </Cell>
          ))}
        </div>
        <div className="flex flex-col flex-grow">
          <header className="flex justify-between mb-2">
            {WEEKS_IN_ONE_YEAR.map((_, i) => (
              <Cell
                key={`header-${i}`}
                className={clsx({ 'mr-4': (i + 1) % 4 === 0 })}
              >
                {getNthByStep(i, 4)}
              </Cell>
            ))}
          </header>
          {LIFE_IN_YEARS.map((_, x) => (
            <div
              key={`row-${x}`}
              className={clsx('mb-1 flex justify-between', {
                'mb-4': (x + 1) % 10 === 0,
              })}
            >
              {WEEKS_IN_ONE_YEAR.map((_, y) => {
                const week = WEEKS_IN_ONE_YEAR.length * x + y + 1

                return (
                  <Cell
                    key={`cell-${x}-${y}`}
                    colorfull={week < weeks}
                    className={clsx({ 'mr-4': (y + 1) % 4 === 0 })}
                    borderfull
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function getServerSideProps({ query }) {
  const rightDate = parseDate(query.birthdate, 'yyyy-MM-dd', new Date())

  return {
    props: {
      weeks: differenceInWeeks(new Date(), rightDate),
    },
  }
}
