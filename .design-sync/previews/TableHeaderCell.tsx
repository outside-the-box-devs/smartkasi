import {Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell} from '@astryxdesign/core/Table';
import {Text} from '@astryxdesign/core/Text';

/** Plain text header cells labelling a shop list's columns. */
export const TextHeaderCells = () => (
  <Table density="balanced" hasHover>
    <TableHeader>
      <TableRow isHeaderRow>
        <TableHeaderCell>Shop</TableHeaderCell>
        <TableHeaderCell>Township</TableHeaderCell>
        <TableHeaderCell>Licence</TableHeaderCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Thoko&apos;s Spaza</TableCell>
        <TableCell>Orlando East</TableCell>
        <TableCell>Verified</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Kasi Corner Store</TableCell>
        <TableCell>Diepkloof</TableCell>
        <TableCell>Under review</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

/** A numeric column's header right-aligned to match the values below it. */
export const AlignedNumericHeader = () => (
  <Table density="balanced">
    <TableHeader>
      <TableRow isHeaderRow>
        <TableHeaderCell>Product</TableHeaderCell>
        <TableHeaderCell scope="col">
          <Text style={{textAlign: 'right', display: 'block'}}>In stock</Text>
        </TableHeaderCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Maize meal · Iwisa 10kg</TableCell>
        <TableCell>
          <Text hasTabularNumbers style={{textAlign: 'right', display: 'block'}}>
            24
          </Text>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Cooking oil · Sunfoil 2L</TableCell>
        <TableCell>
          <Text hasTabularNumbers style={{textAlign: 'right', display: 'block'}}>
            3
          </Text>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

/** A row-header pattern: the leading cell in each body row scoped as a row header. */
export const RowScopedFirstColumn = () => (
  <Table density="compact" dividers="rows">
    <TableHeader>
      <TableRow isHeaderRow>
        <TableHeaderCell scope="col">Order leg</TableHeaderCell>
        <TableHeaderCell scope="col">Status</TableHeaderCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell scope="row">Order #1042</TableCell>
        <TableCell>Pending</TableCell>
      </TableRow>
      <TableRow>
        <TableCell scope="row">Order #1041</TableCell>
        <TableCell>Accepted</TableCell>
      </TableRow>
      <TableRow>
        <TableCell scope="row">Order #1039</TableCell>
        <TableCell>Ready</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
