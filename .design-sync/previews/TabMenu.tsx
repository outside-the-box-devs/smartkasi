import {TabList, Tab, TabMenu} from '@astryxdesign/core/TabList';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Stack';
import {Cog6ToothIcon, QuestionMarkCircleIcon, MegaphoneIcon} from '@heroicons/react/24/outline';

/**
 * TabMenu only renders inside a TabList — it reads the shared value/onChange
 * from context, the same as Tab. Nothing in its own options is active here.
 */
export const CollapsedOverflow = () => (
  <TabList value="stock" onChange={() => {}} label="Shop sections">
    <Tab value="overview" label="Overview" />
    <Tab value="stock" label="Stock" />
    <Tab value="sell" label="Sell" />
    <TabMenu
      label="More"
      options={[
        {value: 'flyers', label: 'Flyers', icon: <MegaphoneIcon />},
        {value: 'settings', label: 'Settings', icon: <Cog6ToothIcon />},
      ]}
    />
  </TabList>
);

/** The trigger shows the active option's own label once one of its options is selected. */
export const ActiveOptionSelected = () => (
  <TabList value="flyers" onChange={() => {}} label="Shop sections">
    <Tab value="overview" label="Overview" />
    <Tab value="stock" label="Stock" />
    <Tab value="sell" label="Sell" />
    <TabMenu
      label="More"
      options={[
        {value: 'flyers', label: 'Flyers', icon: <MegaphoneIcon />},
        {value: 'settings', label: 'Settings', icon: <Cog6ToothIcon />},
      ]}
    />
  </TabList>
);

/** A longer overflow list — help and settings tucked behind one trigger. */
export const LongerOptionList = () => (
  <VStack gap={2} style={{alignItems: 'flex-start'}}>
    <TabList value="stock" onChange={() => {}} label="Shop sections">
      <Tab value="stock" label="Stock" />
      <Tab value="sell" label="Sell" />
      <TabMenu
        label="More"
        options={[
          {value: 'licence', label: 'Licence'},
          {value: 'flyers', label: 'Flyers', icon: <MegaphoneIcon />},
          {value: 'help', label: 'How to use SmartKasi', icon: <QuestionMarkCircleIcon />},
          {value: 'settings', label: 'Settings', icon: <Cog6ToothIcon />},
        ]}
      />
    </TabList>
    <Text type="supporting">
      Keeps the visible strip to the sections an owner opens every day.
    </Text>
  </VStack>
);
