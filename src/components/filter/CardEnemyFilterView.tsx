import React, { useContext } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { t } from 'ttag';

import SliderChooser from './SliderChooser';
import ToggleFilter from '@components/core/ToggleFilter';
import COLORS from '@styles/colors';
import space from '@styles/space';
import StyleContext from '@styles/StyleContext';
import useFilterFunctions, { FilterFunctionProps } from './useFilterFunctions';
import { NavigationProps } from '@components/nav/types';

const CardEnemeyFilterView = (props: FilterFunctionProps & NavigationProps) => {
  const {
    defaultFilterState,
    filters,
    onToggleChange,
    onFilterChange,
  } = useFilterFunctions(props, {
    title: t`Enemy Filters`,
    clearTraits: [
      'enemyHealth',
      'enemyHealthEnabled',
      'enemyHealthPerInvestigator',
      'enemyDamage',
      'enemyDamageEnabled',
      'enemyHorror',
      'enemyHorrorEnabled',
      'enemyFight',
      'enemyFightEnabled',
      'enemyEvade',
      'enemyEvadeEnabled',
    ],
  });
  const {
    enemyHealth,
    enemyHealthEnabled,
    enemyHealthPerInvestigator,
    enemyDamage,
    enemyDamageEnabled,
    enemyHorror,
    enemyHorrorEnabled,
    enemyFight,
    enemyFightEnabled,
    enemyEvade,
    enemyEvadeEnabled,
    enemyElite,
    enemyNonElite,
    enemyParley,
    enemyRetaliate,
    enemyAlert,
    enemyHunter,
    enemyNonHunter,
    enemySpawn,
    enemyPrey,
    enemyAloof,
    enemyMassive,
    enemySwarm,
  } = filters;
  const { backgroundStyle, width } = useContext(StyleContext);
  return (
    <ScrollView contentContainerStyle={backgroundStyle}>
      <SliderChooser
        label={t`Fight`}
        width={width}
        max={defaultFilterState.enemyFight[1]}
        values={enemyFight}
        setting="enemyFight"
        onFilterChange={onFilterChange}
        enabled={enemyFightEnabled}
        toggleName="enemyFightEnabled"
        onToggleChange={onToggleChange}
      />
      <SliderChooser
        label={t`Health`}
        width={width}
        max={defaultFilterState.enemyHealth[1]}
        values={enemyHealth}
        setting="enemyHealth"
        onFilterChange={onFilterChange}
        enabled={enemyHealthEnabled}
        toggleName="enemyHealthEnabled"
        onToggleChange={onToggleChange}
        height={1}
      >
        <View>
          <ToggleFilter
            label={t`Per Investigator`}
            setting="enemyHealthPerInvestigator"
            value={enemyHealthPerInvestigator}
            onChange={onToggleChange}
          />
        </View>
      </SliderChooser>
      <SliderChooser
        label={t`Evade`}
        width={width}
        max={defaultFilterState.enemyEvade[1]}
        values={enemyEvade}
        setting="enemyEvade"
        onFilterChange={onFilterChange}
        enabled={enemyEvadeEnabled}
        toggleName="enemyEvadeEnabled"
        onToggleChange={onToggleChange}
      />
      <SliderChooser
        label={t`Damage`}
        width={width}
        max={defaultFilterState.enemyDamage[1]}
        values={enemyDamage}
        setting="enemyDamage"
        onFilterChange={onFilterChange}
        enabled={enemyDamageEnabled}
        toggleName="enemyDamageEnabled"
        onToggleChange={onToggleChange}
      />
      <SliderChooser
        label={t`Horror`}
        width={width}
        max={defaultFilterState.enemyHorror[1]}
        values={enemyHorror}
        setting="enemyHorror"
        onFilterChange={onFilterChange}
        enabled={enemyHorrorEnabled}
        toggleName="enemyHorrorEnabled"
        onToggleChange={onToggleChange}
      />
      <View style={[styles.toggleRow, space.marginTopXs]}>
        <View style={styles.toggleColumn}>
          <ToggleFilter
            label={t`Elite`}
            setting="enemyElite"
            value={enemyElite}
            onChange={onToggleChange}
          />
          <ToggleFilter
            label={t`Hunter`}
            setting="enemyHunter"
            value={enemyHunter}
            onChange={onToggleChange}
          />
          <ToggleFilter
            label={t`Alert`}
            setting="enemyAlert"
            value={enemyAlert}
            onChange={onToggleChange}
          />
          <ToggleFilter
            label={t`Spawn`}
            setting="enemySpawn"
            value={enemySpawn}
            onChange={onToggleChange}
          />
          <ToggleFilter
            label={t`Aloof`}
            setting="enemyAloof"
            value={enemyAloof}
            onChange={onToggleChange}
          />
          <ToggleFilter
            label={t`Massive`}
            setting="enemyMassive"
            value={enemyMassive}
            onChange={onToggleChange}
          />
        </View>
        <View style={styles.toggleColumn}>
          <ToggleFilter
            label={t`Non-Elite`}
            setting="enemyNonElite"
            value={enemyNonElite}
            onChange={onToggleChange}
          />
          <ToggleFilter
            label={t`Non-Hunter`}
            setting="enemyNonHunter"
            value={enemyNonHunter}
            onChange={onToggleChange}
          />
          <ToggleFilter
            label={t`Retaliate`}
            setting="enemyRetaliate"
            value={enemyRetaliate}
            onChange={onToggleChange}
          />
          <ToggleFilter
            label={t`Parley`}
            setting="enemyParley"
            value={enemyParley}
            onChange={onToggleChange}
          />
          <ToggleFilter
            label={t`Prey`}
            setting="enemyPrey"
            value={enemyPrey}
            onChange={onToggleChange}
          />
          <ToggleFilter
            label={t`Swarm`}
            setting="enemySwarm"
            value={enemySwarm}
            onChange={onToggleChange}
          />
        </View>
      </View>
    </ScrollView>
  );
};
CardEnemeyFilterView.options = () => {
  return {
    topBar: {
      backButton: {
        title: t`Back`,
        color: COLORS.M,
      },
      title: {
        text: t`Enemy Filters`,
      },
    },
  };
};
export default CardEnemeyFilterView;

const styles = StyleSheet.create({
  toggleColumn: {
    width: '50%',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});
