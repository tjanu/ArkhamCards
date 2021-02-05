import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { keys, map, filter, flatMap } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { Navigation, OptionsModalPresentationStyle } from 'react-native-navigation';
import { t } from 'ttag';

import BasicButton from '@components/core/BasicButton';
import { CampaignId, CampaignNotes, CUSTOM, Deck, DeckId, getCampaignId, getDeckId, InvestigatorData, Slots, WeaknessSet } from '@actions/types';
import CampaignLogSection from '../CampaignLogSection';
import ChaosBagSection from './ChaosBagSection';
import DecksSection from './DecksSection';
import AddCampaignNoteSectionDialog, { AddSectionFunction } from '../AddCampaignNoteSectionDialog';
import { ChaosBag } from '@app_constants';
import { updateCampaign, updateCampaignSpentXp, cleanBrokenCampaigns, addInvestigator, removeInvestigator } from '../actions';
import { NavigationProps } from '@components/nav/types';
import { getAllDecks, getDeck } from '@reducers';
import COLORS from '@styles/colors';
import StyleContext from '@styles/StyleContext';
import { useCampaign, useCampaignDetails, useCampaignScenarios, useFlag, useInvestigatorCards, useNavigationButtonPressed, usePlayerCards } from '@components/core/hooks';
import useTraumaDialog from '../useTraumaDialog';
import { showAddScenarioResult, showChaosBagOddsCalculator, showDrawWeakness, showDrawChaosBag } from '@components/campaign/nav';
import useTabView from '@components/core/useTabView';
import RoundedFactionBlock from '@components/core/RoundedFactionBlock';
import RoundedFooterButton from '@components/core/RoundedFooterButton';
import { EditScenarioResultProps } from '../EditScenarioResultView';
import CampaignScenarioButton from '../CampaignScenarioButton';
import { campaignNames, completedScenario } from '../constants';
import space from '@styles/space';
import CampaignSummaryHeader from '../CampaignSummaryHeader';
import ArkhamButton from '@components/core/ArkhamButton';
import LoadingSpinner from '@components/core/LoadingSpinner';
import { useAlertDialog, useSimpleTextDialog } from '@components/deck/dialogs';
import CampaignGuideFab from '@components/campaignguide/CampaignGuideFab';
import { maybeShowWeaknessPrompt } from '../campaignHelper';
import Card from '@data/Card';
import { MyDecksSelectorProps } from '../MyDecksSelectorDialog';
import ArkhamCardsAuthContext from '@lib/ArkhamCardsAuthContext';
import { useCampaignId } from '../hooks';
import useTextEditDialog from '@components/core/useTextEditDialog';

export interface CampaignDetailProps {
  campaignId: CampaignId;
}

type Props = NavigationProps & CampaignDetailProps

function ScenarioResultButton({ name, campaignId, componentId, status, index, onPress }: {
  name: string;
  campaignId: CampaignId;
  componentId: string;
  status: 'completed' | 'playable';
  index: number;
  onPress?: () => void;
}) {
  const buttonOnPress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      Navigation.push<EditScenarioResultProps>(componentId, {
        component: {
          name: 'Campaign.EditResult',
          passProps: {
            campaignId,
            index,
          },
        },
      });
    }
  }, [componentId, campaignId, index, onPress]);
  return (
    <CampaignScenarioButton
      onPress={buttonOnPress}
      status={status}
      title={name}
    />
  );
}

function CampaignDetailView(props: Props) {
  const { componentId } = props;
  const [textEditDialog, showTextEditDialog] = useTextEditDialog();
  const [campaignId, setCampaignServerId] = useCampaignId(props.campaignId);
  const { backgroundStyle } = useContext(StyleContext);
  const { user } = useContext(ArkhamCardsAuthContext);
  const investigators = useInvestigatorCards();
  const cards = usePlayerCards();
  const campaign = useCampaign(campaignId);
  const decks = useSelector(getAllDecks);
  const {
    showTraumaDialog,
    investigatorDataUpdates,
    traumaDialog,
  } = useTraumaDialog({});
  const [latestDeckIds, allInvestigators] = useCampaignDetails(campaign, investigators);

  const dispatch = useDispatch();
  const updateCampaignNotes = useCallback((campaignNotes: CampaignNotes) => {
    dispatch(updateCampaign(user, campaignId, { campaignNotes }));
  }, [dispatch, campaignId, user]);
  const updateInvestigatorData = useCallback((investigatorData: InvestigatorData) => {
    dispatch(updateCampaign(user, campaignId, { investigatorData }));
  }, [dispatch, campaignId, user]);
  const updateChaosBag = useCallback((chaosBag: ChaosBag) => {
    dispatch(updateCampaign(user, campaignId, { chaosBag }));
  }, [dispatch, campaignId, user]);
  const updateWeaknessSet = useCallback((weaknessSet: WeaknessSet) => {
    dispatch(updateCampaign(user, campaignId, { weaknessSet }));
  }, [dispatch, campaignId, user]);
  const addSectionCallback = useRef<AddSectionFunction>();
  const [addSectionVisible, setAddSectionVisible] = useState(false);
  const incSpentXp = useCallback((code: string) => {
    dispatch(updateCampaignSpentXp(campaignId, code, 'inc'));
  }, [campaignId, dispatch]);
  const decSpentXp = useCallback((code: string) => {
    dispatch(updateCampaignSpentXp(campaignId, code, 'dec'));
  }, [campaignId, dispatch]);

  const showAddSectionDialog = useCallback((addSectionFunction: AddSectionFunction) => {
    addSectionCallback.current = addSectionFunction;
    setAddSectionVisible(true);
  }, [addSectionCallback, setAddSectionVisible]);
  const hideAddSectionDialog = useCallback(() => {
    setAddSectionVisible(false);
    addSectionCallback.current = undefined;
  }, [addSectionCallback, setAddSectionVisible]);

  useEffect(() => {
    if (campaign?.name) {
      Navigation.mergeOptions(componentId, {
        topBar: {
          title: {
            text: campaign.name,
          },
        },
      });
    }
  }, [campaign?.name, componentId]);

  useEffect(() => {
    if (campaign && keys(investigatorDataUpdates).length) {
      updateInvestigatorData({
        ...campaign.investigatorData,
        ...investigatorDataUpdates,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investigatorDataUpdates, updateInvestigatorData]);

  const oddsCalculatorPressed = useCallback(() => {
    showChaosBagOddsCalculator(componentId, campaignId, allInvestigators);
  }, [componentId, campaignId, allInvestigators]);

  const cleanBrokenCampaignsPressed = useCallback(() => {
    dispatch(cleanBrokenCampaigns());
    Navigation.pop(componentId);
  }, [componentId, dispatch]);

  const addScenarioResultPressed = useCallback(() => {
    showAddScenarioResult(componentId, campaignId);
  }, [campaignId, componentId]);

  const drawChaosBagPressed = useCallback(() => {
    showDrawChaosBag(componentId, campaignId, updateChaosBag);
  }, [campaignId, componentId, updateChaosBag]);

  const drawWeaknessPressed = useCallback(() => {
    showDrawWeakness(componentId, campaignId);
  }, [componentId, campaignId]);

  const updateCampaignName = useCallback((name: string) => {
    dispatch(updateCampaign(user, campaignId, { name, lastUpdated: new Date() }));
    Navigation.mergeOptions(componentId, {
      topBar: {
        title: {
          text: name,
        },
      },
    });
  }, [campaignId, dispatch, user, componentId]);
  const { dialog, showDialog: showEditNameDialog } = useSimpleTextDialog({
    title: t`Name`,
    value: campaign?.name || '',
    onValueChange: updateCampaignName,
  });

  useNavigationButtonPressed(({ buttonId }) => {
    if (buttonId === 'edit') {
      showEditNameDialog();
    }
  }, componentId, [showEditNameDialog]);


  const updateWeaknessAssignedCards = useCallback((weaknessCards: Slots) => {
    if (campaign) {
      updateWeaknessSet({
        ...campaign.weaknessSet,
        assignedCards: weaknessCards,
      });
    }
  }, [updateWeaknessSet, campaign]);
  const [alertDialog, showAlert] = useAlertDialog();

  const checkForWeaknessPrompt = useCallback((deck: Deck) => {
    if (cards && campaign) {
      maybeShowWeaknessPrompt(
        deck,
        cards,
        campaign.weaknessSet.assignedCards,
        updateWeaknessAssignedCards,
        showAlert
      );
    }
  }, [cards, campaign, updateWeaknessAssignedCards, showAlert]);

  const onAddDeck = useCallback((deck: Deck) => {
    dispatch(addInvestigator(user, campaignId, deck.investigator_code, getDeckId(deck)));
    checkForWeaknessPrompt(deck);
  }, [user, campaignId, dispatch, checkForWeaknessPrompt]);

  const onAddInvestigator = useCallback((card: Card) => {
    dispatch(addInvestigator(user, campaignId, card.code));
  }, [user, campaignId, dispatch]);

  const onRemoveInvestigator = useCallback((investigator: Card, removedDeckId?: DeckId) => {
    dispatch(removeInvestigator(user, campaignId, investigator.code, removedDeckId));
  }, [user, campaignId, dispatch]);

  const showChooseDeck = useCallback((
    singleInvestigator?: Card,
  ) => {
    if (!cards || !campaign) {
      return;
    }
    const campaignInvestigators = flatMap(latestDeckIds, deckId => {
      const deck = getDeck(decks, deckId);
      return (deck && cards[deck.investigator_code]) || [];
    });

    const passProps: MyDecksSelectorProps = singleInvestigator ? {
      campaignId: getCampaignId(campaign),
      singleInvestigator: singleInvestigator.code,
      onDeckSelect: onAddDeck,
    } : {
      campaignId: getCampaignId(campaign),
      selectedInvestigatorIds: map(
        campaignInvestigators,
        investigator => investigator.code
      ),
      onDeckSelect: onAddDeck,
      onInvestigatorSelect: onAddInvestigator,
      simpleOptions: true,
    };
    Navigation.showModal({
      stack: {
        children: [{
          component: {
            name: 'Dialog.DeckSelector',
            passProps,
            options: {
              modalPresentationStyle: Platform.OS === 'ios' ?
                OptionsModalPresentationStyle.fullScreen :
                OptionsModalPresentationStyle.overCurrentContext,
            },
          },
        }],
      },
    });
  }, [campaign, latestDeckIds, decks, cards, onAddDeck, onAddInvestigator]);

  const showAddInvestigator = useCallback(() => {
    showChooseDeck();
  }, [showChooseDeck]);
  const [removeMode, toggleRemoveMode] = useFlag(false);
  const decksTab = useMemo(() => {
    if (!campaign) {
      return <LoadingSpinner />;
    }
    return (
      <View style={[styles.flex, backgroundStyle]}>
        <ScrollView contentContainerStyle={backgroundStyle}>
          <View style={[space.paddingSideS, space.paddingBottomS]}>
            { !!cards && (
              <DecksSection
                showAlert={showAlert}
                header={
                  <CampaignSummaryHeader
                    name={campaign.cycleCode === CUSTOM ? campaign.name : campaignNames()[campaign.cycleCode]}
                    cycle={campaign.cycleCode}
                    difficulty={campaign.difficulty}
                    inverted
                  />
                }
                componentId={componentId}
                campaign={campaign}
                campaignId={campaignId}
                latestDeckIds={latestDeckIds || []}
                decks={decks}
                allInvestigators={allInvestigators}
                cards={cards}
                investigatorData={campaign.investigatorData || {}}
                showTraumaDialog={showTraumaDialog}
                removeInvestigator={onRemoveInvestigator}
                incSpentXp={incSpentXp}
                decSpentXp={decSpentXp}
                removeMode={removeMode}
                toggleRemoveMode={toggleRemoveMode}
                showChooseDeck={showChooseDeck}
              />
            ) }
          </View>
          <ArkhamButton
            icon="card"
            title={t`Draw random basic weakness`}
            onPress={drawWeaknessPressed}
          />
        </ScrollView>
      </View>
    );
  }, [campaign, latestDeckIds, decks, allInvestigators, cards, backgroundStyle, componentId, removeMode, campaignId,
    toggleRemoveMode, showChooseDeck, showAlert,
    drawWeaknessPressed, showTraumaDialog, onRemoveInvestigator, incSpentXp, decSpentXp]);
  const [cycleScenarios] = useCampaignScenarios(campaign);
  const scenariosTab = useMemo(() => {
    if (!campaign) {
      return <LoadingSpinner />;
    }
    const hasCompletedScenario = completedScenario(campaign.scenarioResults);
    return (
      <View style={[styles.flex, backgroundStyle]}>
        <ScrollView contentContainerStyle={backgroundStyle}>
          { (campaign.scenarioResults.length === 0 && cycleScenarios.length === 0) ? (
            <ArkhamButton
              icon="expand"
              title={t`Record Scenario Result`}
              onPress={addScenarioResultPressed}
            />
          ) : (
            <View style={[space.paddingSideS, space.paddingBottomS]}>
              <RoundedFactionBlock faction="neutral"
                header={undefined}
                footer={<RoundedFooterButton icon="expand" title={t`Record Scenario Result`} onPress={addScenarioResultPressed} />}
              >
                { map(campaign.scenarioResults, (scenario, idx) => {
                  console.log(campaign);
                  return (
                    <ScenarioResultButton
                      key={idx}
                      componentId={componentId}
                      campaignId={campaignId}
                      name={scenario.interlude ? scenario.scenario : `${scenario.scenario} (${scenario.resolution}, ${scenario.xp || 0} XP)`}
                      index={idx}
                      status="completed"
                    />
                  );
                }) }
                { map(
                  filter(cycleScenarios, scenario => !hasCompletedScenario(scenario)),
                  (scenario, idx) => (
                    <ScenarioResultButton
                      key={idx}
                      componentId={componentId}
                      campaignId={campaignId}
                      name={scenario.name}
                      index={-1}
                      status="playable"
                      onPress={addScenarioResultPressed}
                    />
                  ))
                }
              </RoundedFactionBlock>
            </View>
          ) }
        </ScrollView>
      </View>
    );
  }, [backgroundStyle, campaign, campaignId, addScenarioResultPressed, componentId, cycleScenarios]);
  const logsTab = useMemo(() => {
    if (!campaign) {
      return <LoadingSpinner />;
    }
    return (
      <View style={[styles.flex, backgroundStyle]}>
        <ScrollView contentContainerStyle={backgroundStyle}>
          <ChaosBagSection
            componentId={componentId}
            updateChaosBag={updateChaosBag}
            chaosBag={campaign.chaosBag}
            showChaosBag={drawChaosBagPressed}
            showOddsCalculator={oddsCalculatorPressed}
          />
          <CampaignLogSection
            campaignNotes={campaign.campaignNotes}
            allInvestigators={allInvestigators}
            updateCampaignNotes={updateCampaignNotes}
            showTextEditDialog={showTextEditDialog}
            showAddSectionDialog={showAddSectionDialog}
          />
        </ScrollView>
      </View>
    );
  }, [campaign, backgroundStyle, allInvestigators, componentId,
    updateChaosBag, drawChaosBagPressed, oddsCalculatorPressed, updateCampaignNotes, showTextEditDialog, showAddSectionDialog]);
  const tabs = useMemo(() => {
    return [
      {
        key: 'investigators',
        title: t`Decks`,
        node: decksTab,
      },
      {
        key: 'scenarios',
        title: t`Scenarios`,
        node: scenariosTab,
      },
      {
        key: 'log',
        title: t`Log`,
        node: logsTab,
      },
    ];
  }, [decksTab, scenariosTab, logsTab]);
  const [tabView, setSelectedTab] = useTabView({ tabs });
  if (!campaign) {
    return (
      <View>
        <BasicButton
          title={t`Clean up broken campaigns`}
          color={COLORS.red}
          onPress={cleanBrokenCampaignsPressed}
        />
      </View>
    );
  }
  return (
    <View style={[styles.flex, backgroundStyle]}>
      { tabView }
      <AddCampaignNoteSectionDialog
        visible={addSectionVisible}
        addSection={addSectionCallback.current}
        hide={hideAddSectionDialog}
      />
      <CampaignGuideFab
        setSelectedTab={setSelectedTab}
        setCampaignServerId={setCampaignServerId}
        componentId={componentId}
        campaignId={campaignId}
        campaignName={''}
        removeMode={removeMode}
        showEditNameDialog={showEditNameDialog}
        showAddInvestigator={showAddInvestigator}
        toggleRemoveInvestigator={toggleRemoveMode}
        guided={false}
        showAlert={showAlert}
      />
      { alertDialog }
      { traumaDialog }
      { dialog }
      { textEditDialog }
    </View>
  );
}

CampaignDetailView.options = () => {
  return {
    topBar: {
      title: {
        text: t`Campaign`,
      },
    },
  };
};
export default CampaignDetailView;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
