/*
    Copyright (c) 2022 IBM Corp.
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

import React from "react";
import { Box } from '@mui/material';
import useSearchElement from "./sidebar/customHooks/useSearchElement";
import Drawer from '@mui/material/Drawer';
import useUpdateLabelState from "./sidebar/customHooks/useUpdateLabelState";
import {
  RIGHT_DRAWER_WIDTH,
  sidebarOptionEnum
} from "../../const";
import MainPanel from "./main/MainPanel";
import { useSelector } from "react-redux";

export const PanelManager = ({ 
    children,
    handleKeyEvent,
    open
}) => {
    const activePanel = useSelector(state => state.workspace.activePanel)

    const { updateSearchLabelState,
        updateRecLabelState,
        updateMainLabelState,
        updatePosPredLabelState,
        updatePosElemLabelState,
        updateDisagreelemLabelState,
        updateSuspiciouslemLabelState,
        updateContradictivelemLabelState,
        updateEvaluationLabelState,
    } = useUpdateLabelState()

    const { handleSearchPanelClick,
        handleSearchInputEnterKey,
        handleSearch,
        handleSearchInputChange,
        searchInput } = useSearchElement()

    const activePanelWithProps = React.Children.map(children, child => {

        if (child) {
            if (activePanel === sidebarOptionEnum.SEARCH) {
                return React.cloneElement(child, {
                    handleSearchPanelClick,
                    handleSearchInputEnterKey,
                    handleSearch,
                    handleSearchInputChange,
                    searchInput,
                    updateMainLabelState,
                    updateLabelState: updateSearchLabelState,
                    handleKeyEvent,
                    open,
                });
            }
            else if (activePanel === sidebarOptionEnum.LABEL_NEXT) {
                return React.cloneElement(child, {
                    handleSearchPanelClick,
                    searchInput,
                    updateMainLabelState,
                    updateLabelState: updateRecLabelState,
                    open,
                });
            }
            else if (activePanel === sidebarOptionEnum.POSITIVE_PREDICTIONS) {
                return React.cloneElement(child, {
                    handleSearchPanelClick,
                    searchInput,
                    updateMainLabelState,
                    updateLabelState: updatePosPredLabelState,
                    open,
                });
            }
            else if (activePanel === sidebarOptionEnum.POSITIVE_LABELS) {
                return React.cloneElement(child, {
                    handleSearchPanelClick,
                    searchInput,
                    updateMainLabelState,
                    updateLabelState: updatePosElemLabelState,
                    open,
                });
            }
            else if (activePanel === sidebarOptionEnum.DISAGREEMENTS) {
                return React.cloneElement(child, {
                    handleSearchPanelClick,
                    searchInput,
                    updateMainLabelState,
                    updateLabelState: updateDisagreelemLabelState,
                    open,
                });
            }
            else if (activePanel === sidebarOptionEnum.SUSPICIOUS_LABELS) {
                return React.cloneElement(child, {
                    handleSearchPanelClick,
                    searchInput,
                    updateMainLabelState,
                    updateLabelState: updateSuspiciouslemLabelState,
                    open,
                });
            }
            else if (activePanel === sidebarOptionEnum.CONTRADICTING_LABELS) {
                return React.cloneElement(child, {
                    handleSearchPanelClick,
                    searchInput,
                    updateMainLabelState,
                    updateLabelState: updateContradictivelemLabelState,
                    open,
                });
            }
            else if (activePanel === sidebarOptionEnum.EVALUATION) {
                return React.cloneElement(child, {
                    handleSearchPanelClick,
                    searchInput,
                    updateMainLabelState,
                    updateLabelState: updateEvaluationLabelState,
                    open,
                });
            }
        }
        else return child
    });

    return (
        <Box>
            <MainPanel handleKeyEvent={handleKeyEvent} open={open} />
            <Drawer sx={{
                width: RIGHT_DRAWER_WIDTH, flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: RIGHT_DRAWER_WIDTH,
                    boxSizing: 'border-box',
                }
            }}
                PaperProps={{ sx: { backgroundColor: "#f8f9fa !important", right: 50, } }}
                variant="persistent"
                anchor="right"
                open={open}
            >
                {activePanelWithProps}
            </Drawer>
        </Box>
    )
}

