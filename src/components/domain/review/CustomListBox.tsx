import { Listbox, Transition } from '@headlessui/react'
import { ChevronDown } from 'lucide-react'
import { Fragment } from 'react'

interface ListboxOption {
  name: string
  value: string
}

interface CustomListboxProps {
  // value에 null을 허용하도록 타입 수정
  value: string | null
  onChange: (val: string) => void
  options: ListboxOption[]
  placeholder: string
}

export default function CustomListbox({
  value,
  onChange,
  options,
  placeholder,
}: CustomListboxProps) {
  // value가 null일 경우를 대비해 기본값 ''를 할당하여 find 수행
  const selectedOption = options.find((opt) => opt.value === (value ?? ''))
  const displayLabel = selectedOption ? selectedOption.name : placeholder

  return (
    <div className="relative w-[110px]">
      {/* Listbox의 value가 null인 경우 경고를 방지하기 위해 '' 전달 */}
      <Listbox value={value ?? ''} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-left text-xs text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-400">
            <span className="block truncate">{displayLabel}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown
                className="h-3.5 w-3.5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-xs shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100">
              {options.map((opt, idx) => (
                <Listbox.Option
                  key={idx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2.5 px-3 transition-colors ${
                      active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`
                  }
                  value={opt.value}
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${selected ? 'font-semibold text-blue-600' : 'font-normal'}`}
                    >
                      {opt.name}
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}
