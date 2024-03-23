/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {HealthAssetTransferContract} from './health-chaincode';

export {HealthAssetTransferContract as AssetTransferContract} from './health-chaincode'; // not sure if this export name can be changed

export const contracts: any[] = [HealthAssetTransferContract];