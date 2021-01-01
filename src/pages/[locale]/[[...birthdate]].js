import clsx from 'clsx'
import clamp from 'lodash.clamp'
import differenceInDays from 'date-fns/differenceInDays'
import parseDate from 'date-fns/parse'
import db from '~/life-expectancy.json'

const WEEKS_IN_ONE_YEAR = Array.from({ length: 52 })

const LIFE_IN_YEARS = Array.from({ length: 100 })

function getNthByStep(i, step) {
  const nth = i + 1

  if (i === 0 || nth % step === 0) {
    return nth
  }

  return null
}

function Cell({ borderful, disabled, className, styles, children }) {
  return (
    <span
      style={styles}
      className={clsx(
        'flex w-4 h-4 text-gray-300 flex-shrink-0 font-mono',
        borderful && 'border rounded-sm',
        disabled
          ? ['bg-gray-700 text-gray-600', borderful && 'border-gray-600']
          : {
              'border-gray-400': borderful,
            },
        className
      )}
    >
      {children}
    </span>
  )
}

function Stat({ value, title }) {
  return (
    <div className="text-gray-300">
      <span className="text-lg md:text-xl">{Number(value).toFixed(2)}</span>{' '}
      <span className="text-sm md:text-base">{title}</span>
    </div>
  )
}

export default function IndexPage({
  userWeeks,
  lifeExpectancyWeeks,
  lifeExpectancyYears,
}) {
  return (
    <div className="md:max-w-7xl md:ml-auto md:mr-auto">
      <header className="flex justify-center items-center py-4 md:py-8 text-2xl md:text-4xl">
        <h1 className="text-gray-300 font-heading">MY LIFE IN WEEKS</h1>
      </header>
      <section className="flex flex-col md:flex-row items-center md:justify-center px-6 md:px-0 space-y-2 md:space-x-4 md:space-y-0 font-mono mb-3">
        <Stat value={userWeeks} title="consumed weeks" />
        <div className="h-3 w-0.5 bg-gray-300 my-auto hidden md:block" />
        <Stat value={lifeExpectancyWeeks} title="expected weeks" />
        <div className="h-3 w-0.5 bg-gray-300 my-auto hidden md:block" />
        <Stat value={lifeExpectancyWeeks - userWeeks} title="remaining weeks" />
      </section>
      <div className="flex p-1 pr-2 md:p-4">
        <div className="flex flex-col mr-2 pt-6">
          {LIFE_IN_YEARS.map((_, i) => {
            const isAMultipleOf10 = (i + 1) % 10 === 0

            return (
              <Cell
                key={`years-${i}`}
                disabled={i + 1 > lifeExpectancyYears}
                className={clsx('w-auto items-center justify-end', {
                  'mb-4': isAMultipleOf10,
                  'mb-1': !isAMultipleOf10,
                })}
              >
                {getNthByStep(i, 5)}
              </Cell>
            )
          })}
        </div>
        <div className="flex flex-col flex-grow overflow-y-auto">
          <header className="flex justify-between mb-2">
            {WEEKS_IN_ONE_YEAR.map((_, i) => (
              <Cell
                key={`header-${i}`}
                className={clsx('items-center justify-end', {
                  'mr-4': (i + 1) % 4 === 0,
                })}
              >
                {getNthByStep(i, 4)}
              </Cell>
            ))}
          </header>
          {LIFE_IN_YEARS.map((_, x) => {
            const isAMultipleOf10 = (x + 1) % 10 === 0

            return (
              <div
                key={`row-${x}`}
                className={clsx('flex justify-between', {
                  'mb-4': isAMultipleOf10,
                  'mb-1': !isAMultipleOf10,
                })}
              >
                {WEEKS_IN_ONE_YEAR.map((_, y) => {
                  const week = WEEKS_IN_ONE_YEAR.length * x + y + 1

                  // percentage of cells that must be paint, from 0 to 1
                  const c1 = clamp(1 + (userWeeks - week), 0, 1)

                  // percentage of cells that are available to be paint, from 0 to 1
                  const c2 = clamp(1 + (lifeExpectancyWeeks - week), 0, 1)

                  return (
                    <Cell
                      key={`cell-${x}-${y}`}
                      borderful
                      className={clsx({
                        'mr-4': (y + 1) % 4 === 0,
                        '$colorful-cell bg-gray-600': c1 !== 0,
                        '$available-cell bg-gray-700': c1 === 0 && c2 !== 0,
                      })}
                      disabled={c2 === 0}
                      styles={{
                        '--c1': `${c1 * 100}%`,
                        '--c2': `${c2 * 100}%`,
                      }}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function getServerSideProps({ params }) {
  const rightDate = parseDate(params.birthdate?.[0], 'yyyy-MM-dd', new Date())

  const isValidDate = !Number.isNaN(rightDate.getTime())

  const lifeExpectancyYears = db[params.locale] ?? LIFE_IN_YEARS.length

  return {
    props: {
      lifeExpectancyYears,
      userWeeks: isValidDate ? differenceInDays(new Date(), rightDate) / 7 : 0, // Ref: https://bit.ly/38UaTwC
      lifeExpectancyWeeks: lifeExpectancyYears * WEEKS_IN_ONE_YEAR.length,
    },
  }
}
