<template>
  <div class="table">
    <table>
      <thead>
        <tr
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            :colSpan="header.colSpan"
            :class="{
              left: header.column.id === 'chain',
              small: [
                'chain',
                'timestamp',
                'blockNumber',
                'entryPoint',
              ].includes(header.column.id),
              hash: header.column.id === 'transactionHash',
              address:
                header.column.id === 'sender' ||
                header.column.id === 'bundler' ||
                header.column.id === 'paymaster',
              hide: header.column.id === 'hash',
            }"
          >
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in table.getRowModel().rows"
          :key="row.id"
        >
          <router-link
            class="row"
            :to="{ name: 'op', params: { hash: row.getValue('hash') } }"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="{
                left: cell.column.id === 'chain',
                small: [
                  'chain',
                  'timestamp',
                  'blockNumber',
                  'entryPoint',
                ].includes(cell.column.id),
                hash: cell.column.id === 'transactionHash',
                address:
                  cell.column.id === 'sender' ||
                  cell.column.id === 'bundler' ||
                  cell.column.id === 'paymaster',
                hide: cell.column.id === 'hash',
              }"
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </td>
            <IconArrowRight class="icon" />
          </router-link>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import {
  FlexRender,
  useVueTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/vue-table';
import { Address, Hex, zeroAddress } from 'viem';
import { computed, watch } from 'vue';

import IconArrowRight from '@/components/IconArrowRight.vue';
import { Chain, getChainName } from '@/utils/chains';
import { toRelativeTime } from '@/utils/conversion';
import {
  ENTRY_POINT_0_6_ADDRESS,
  ENTRY_POINT_0_7_ADDRESS,
} from '@/utils/entryPoint';
import { formatRelativeTime } from '@/utils/formatting';

const props = defineProps<{
  ops: UserOp[];
  page: number;
  perPage: number;
}>();

const columnHelper = createColumnHelper<UserOp>();

const columns = computed(() => [
  columnHelper.accessor('chain', {
    header: 'Chain',
    cell: (cell) => getChainName(cell.getValue() as Chain),
  }),
  columnHelper.accessor('timestamp', {
    header: 'Time',
    cell: (cell) =>
      formatRelativeTime(
        toRelativeTime(new Date(), new Date(1000 * cell.getValue())),
      ),
  }),
  columnHelper.accessor('blockNumber', {
    header: 'Block',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('transactionHash', {
    header: 'Transaction',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('sender', {
    header: 'Sender',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('bundler', {
    header: 'Bundler',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('paymaster', {
    header: 'Paymaster',
    cell: (cell) => {
      const value = cell.getValue();
      return value === zeroAddress ? '—' : value;
    },
  }),
  columnHelper.accessor('entryPoint', {
    header: 'Entry Point',
    cell: (cell) => {
      const value = cell.getValue();
      if (value === ENTRY_POINT_0_6_ADDRESS) {
        return '0.6.0';
      }
      if (value === ENTRY_POINT_0_7_ADDRESS) {
        return '0.7.0';
      }
      return '—';
    },
  }),
  columnHelper.accessor('hash', {
    header: 'Hash',
    cell: (cell) => cell.getValue(),
  }),
]);

const table = useVueTable({
  get data() {
    return props.ops;
  },
  columns: columns.value,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});
table.setPageSize(props.perPage);
table.setPageIndex(props.page);

watch(
  () => props.perPage,
  () => {
    table.setPageSize(props.perPage);
  },
);

watch(
  () => props.page,
  () => {
    table.setPageIndex(props.page);
  },
);
</script>

<script lang="ts">
interface UserOp {
  chain: Chain;
  timestamp: number;
  blockNumber: number;
  transactionHash: Hex;
  sender: Address;
  bundler: Address;
  paymaster: Address;
  entryPoint: Address;
  hash: Hex;
}

export type { UserOp };
</script>

<style scoped>
.table {
  overflow-x: auto;
}

table {
  --border-radius: 8px;

  width: 100%;
  border-spacing: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  font-size: 16px;
}

thead {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  border-radius: calc(var(--border-radius) - 1px)
    calc(var(--border-radius) - 1px) 0 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

th,
td {
  overflow: hidden;
  text-align: right;
  cursor: default;
}

th {
  padding: 10px;
  font-weight: var(--font-weight-regular);
}

td {
  padding: 6px 10px;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
}

tr {
  display: flex;
  position: relative;
  margin: 2px;
  transition: opacity 0.25s ease;
  border-radius: 4px;

  td {
    padding: 6px 10px;
  }

  th {
    &:first-child {
      border-radius: calc(var(--border-radius) - 1px) 0 0 0;
    }

    &:last-child {
      border-radius: 0 calc(var(--border-radius) - 1px) 0 0;
    }
  }
}

.icon {
  display: none;
  position: absolute;
  right: 8px;
  width: 20px;
  height: 100%;
  color: #aa00e9;
}

tbody {
  &:hover tr:hover {
    background: var(--color-background-tertiary);

    .icon {
      display: initial;
    }
  }
}

.row {
  display: flex;
  color: initial;
  text-decoration: none;
}

.left {
  text-align: left;
}

.small {
  width: 120px;
}

.hash,
.address {
  width: 170px;
  text-overflow: ellipsis;
}

.hide {
  display: none;
}
</style>
