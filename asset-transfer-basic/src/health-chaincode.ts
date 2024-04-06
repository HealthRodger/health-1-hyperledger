/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {
  Context,
  Contract,
  Info,
  Returns,
  Transaction,
} from "fabric-contract-api";
import stringify from "json-stringify-deterministic";
import sortKeysRecursive from "sort-keys-recursive";
import { Asset } from "./asset";

const VERSION = "1.0.0";
const CONTRACT_NAME = "HealthAssetTransferContract";

@Info({
  title: "Health Chaincode",
  description: "Smart contract for exchange of health/hospital assets",
})
export class HealthAssetTransferContract extends Contract {
  @Transaction(false)
  @Returns("string")
  public async GetContractInfo(ctx: Context): Promise<string> {
    return stringify({
      contractName: CONTRACT_NAME,
      version: VERSION,
    });
  }

  // CreateAsset issues a new asset to the world state with given details.
  @Transaction()
  public async CreateAsset(
    ctx: Context,
    id: string,
    name: string,
    type: string,
    ipAddress: string,
    available: boolean,
    lastUpdate: number,
    isWearable: boolean,
    gpsLocation: string,
    hospital: string,
    department: string,
    contactPerson: string
  ): Promise<void> {
    // Atrtribute based access control
    const attrRes = ctx.clientIdentity.assertAttributeValue(
      "abac.creator",
      "true"
    );
    if (!attrRes) {
      throw new Error(`Client is not authorized to create an asset`);
    }

    const exists = await this.AssetExists(ctx, id);
    if (exists) {
      throw new Error(`The asset ${id} already exists`);
    }

    const ownerClientID = ctx.clientIdentity.getID();

    const asset: Asset = {
      docType: "asset",
      ID: id,
      Name: name,
      Type: type,
      IpAddress: ipAddress,
      Available: available,
      LastUpdate: lastUpdate,
      IsWearable: isWearable,
      GPSLocation: gpsLocation,
      Owner: {
        Hospital: hospital,
        Department: department,
        ContactPerson: contactPerson,
        OwnerClientID: ownerClientID, // get the client ID from the transaction context -> this is the client ID of the creator
      },
    };

    // emit event
    const eventPayload = stringify({
      asset: asset,
      requestedBy: ownerClientID,
      action: "Write",
    });
    ctx.stub.setEvent("CreateAsset", Buffer.from(eventPayload));

    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    await ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(asset)))
    );

    // save to db
    let indexName = "lastUpdate";
    let indexKey = await ctx.stub.createCompositeKey(indexName, [
      asset.LastUpdate.toString(),
    ]);

    await ctx.stub.putState(indexKey, Buffer.from("\u0000"));
  }

  // UpdateAsset updates an existing asset in the world state with provided parameters.
  @Transaction()
  public async UpdateAsset(
    ctx: Context,
    id: string,
    name: string,
    type: string,
    ipAddress: string,
    available: boolean,
    lastUpdate: number,
    isWearable: boolean,
    gpsLocation: string,
    hospital: string,
    department: string,
    contactPerson: string
  ): Promise<void> {
    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }

    const clientID = ctx.clientIdentity.getID();

    const clientIsOwner = await this.ClientIsOwner(ctx, id);
    if (!clientIsOwner) {
      throw new Error(`The asset ${id} is not owned by the client ${clientID}`);
    }

    // overwriting original asset with new asset
    const updatedAsset: Asset = {
      docType: "asset",
      ID: id,
      Name: name,
      Type: type,
      IpAddress: ipAddress,
      Available: available,
      LastUpdate: lastUpdate,
      IsWearable: isWearable,
      GPSLocation: gpsLocation,
      Owner: {
        Hospital: hospital,
        Department: department,
        ContactPerson: contactPerson,
        OwnerClientID: clientID, // could also be taken from the original asset
      },
    };

    // emit event
    const eventPayload = stringify({
      asset: updatedAsset,
      requestedBy: clientID,
      action: "Write",
    });
    ctx.stub.setEvent("UpdateAsset", Buffer.from(eventPayload));

    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    return ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(updatedAsset)))
    );
  }

  // DeleteAsset deletes an given asset from the world state.
  @Transaction()
  public async DeleteAsset(ctx: Context, id: string): Promise<void> {
    if (!id) {
      throw new Error("Asset name must not be empty");
    }

    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }

    const clientID = ctx.clientIdentity.getID();

    const clientIsOwner = await this.ClientIsOwner(ctx, id);
    if (!clientIsOwner) {
      throw new Error(`The asset ${id} is not owned by the client ${clientID}`);
    }

    // emit event
    const asset = await this.ReadAsset(ctx, id);
    const eventPayload = stringify({
      asset: asset,
      requestedBy: clientID,
      action: "Write",
    });
    ctx.stub.setEvent("DeleteAsset", Buffer.from(eventPayload));

    await ctx.stub.deleteState(id);

    const assetJSON = JSON.parse(asset);
    // delete the index
    let indexName = "lastUpdate";
    let indexKey = ctx.stub.createCompositeKey(indexName, [
      assetJSON.LastUpdate.toString(),
    ]);
    if (!indexKey) {
      throw new Error("Failed to create createCompositeKey");
    }
    // Delete index entry to state
    await ctx.stub.deleteState(indexKey);
  }

  // TransferAsset updates the owner field of asset with given id in the world state, and returns the old owner.
  @Transaction()
  public async TransferAsset(
    ctx: Context,
    id: string,
    newOwner: string
  ): Promise<string> {
    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }

    const clientIsOwner = await this.ClientIsOwner(ctx, id);
    if (!clientIsOwner) {
      throw new Error(
        `The asset ${id} is not owned by the client ${ctx.clientIdentity.getID()}`
      );
    }

    const assetString = await this.ReadAsset(ctx, id);
    const asset = JSON.parse(assetString);
    const oldOwner = asset.Owner.OwnerClientID;
    asset.Owner.OwnerClientID = newOwner;

    // emit event
    const eventPayload = stringify({
      asset: asset,
      requestedBy: ctx.clientIdentity.getID(),
      action: "Write",
    });
    ctx.stub.setEvent("TransferAsset", Buffer.from(eventPayload));

    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    await ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(asset)))
    );
    return oldOwner;
  }

  // ReadAsset returns the asset stored in the world state with given id.
  @Transaction()
  public async ReadAsset(ctx: Context, id: string): Promise<string> {
    const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error(`The asset ${id} does not exist`);
    }

    // emit event for read
    const eventPayload = stringify({
      asset: assetJSON,
      requestedBy: ctx.clientIdentity.getID(),
      action: "Read",
    });
    ctx.stub.setEvent("ReadAsset", Buffer.from(eventPayload));

    return assetJSON.toString();
  }

  // GetAllAssets returns all assets found in the world state.
  @Transaction()
  public async GetAllAssets(ctx: Context): Promise<string> {
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange("", "");
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString(
        "utf8"
      );
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }

    // emit event for read
    const eventPayload = stringify({
      asset: allResults,
      requestedBy: ctx.clientIdentity.getID(),
      action: "Read",
    });
    ctx.stub.setEvent("GetAllAssets", Buffer.from(eventPayload));

    return stringify(allResults);
  }

  @Transaction()
  public async QueryAssets(ctx: Context, queryString: string): Promise<string> {
    let resultsIterator = await ctx.stub.getQueryResult(queryString);
    let results = await this.GetAllResults(resultsIterator, false);

    return stringify(results);
  }

  // Iterator here is of type StateQueryIterator, but contract-api won't import that type
  private async GetAllResults(
    iterator: any,
    isHistory: boolean
  ): Promise<any[]> {
    let allResults = [];
    let res = await iterator.next();
    while (!res.done) {
      if (res.value && res.value.value.toString()) {
        let jsonRes: any = {};
        console.log(res.value.value.toString("utf8"));
        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.txId;
          jsonRes.Timestamp = res.value.timestamp;
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString("utf8");
          }
        } else {
          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value.toString("utf8");
          }
        }
        allResults.push(jsonRes);
      }
      res = await iterator.next();
    }
    iterator.close();
    return allResults;
  }

  // AssetExists returns true when asset with given ID exists in world state.
  //   @Transaction(false)
  //   @Returns("boolean")
  private async AssetExists(ctx: Context, id: string): Promise<boolean> {
    const assetJSON = await ctx.stub.getState(id);
    return assetJSON && assetJSON.length > 0;
  }

  private async ClientIsOwner(ctx, id: string): Promise<boolean> {
    const asset = await ctx.stub.getState(id); // get the asset from chaincode state
    const assetJSON = JSON.parse(asset.toString());
    return assetJSON.Owner.OwnerClientID === ctx.clientIdentity.getID();
  }
}
