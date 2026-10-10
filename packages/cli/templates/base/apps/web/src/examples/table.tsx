import type { ColumnDef } from "@tanstack/react-table"
import { tableFeatures, useTable } from "@tanstack/react-table"

type Person = { name: string; role: string }

const features = tableFeatures({})

const data: Array<Person> = [
  { name: "Ada Lovelace", role: "Mathematician" },
  { name: "Grace Hopper", role: "Admiral" },
]

const columns: Array<ColumnDef<typeof features, Person>> = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role" },
]

export function TableExample() {
  const table = useTable({ features, columns, data })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                <table.FlexRender header={header} />
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getAllCells().map((cell) => (
              <td key={cell.id}>
                <table.FlexRender cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
