'use client';

import React, { useEffect, useState } from "react";
import sdk from "@crossmarkio/sdk";
import BuyWeb3Coin from "@/components/buyWeb3Coin";

const DevOptions: React.FC = () => {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [activated, setActivated] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [imageBase64, setImageBase64] = useState<string>("");

  const [nftName, setNftName] = useState<string>("");
  const [nftDescription, setNftDescription] = useState<string>("");
  const [nftQuantidade, setNftQuantidade] = useState<number>(0);
  const [nftPreco, setNftPreco] = useState<number>(0);
  const [gameMetadata, setGameMetadata] = useState<Record<string, string>>({});
  const [metadataKey, setMetadataKey] = useState<string>("");
  const [metadataValue, setMetadataValue] = useState<string>("");

  const destinationAddress = "rspgmhbbCRjkDbjFu4P2MX1agUGDEShYbf";

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const sessionRes = await fetch("/api/session");
        if (!sessionRes.ok) {
          setMessage("You need to be logged in to access these options.");
          setLoading(false);
          return;
        }

        const session = await sessionRes.json();
        const address = session.address;

        if (address) {
          setUserAddress(address);

          const checkRes = await fetch("/api/devUser", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              publicAddress: address,
              tipo: 0,
            }),
          });

          const result = await checkRes.json();
          if (checkRes.ok && result.user) {
            setActivated(result.user.activated);
          } else {
            setActivated(false);
          }
        } else {
          setMessage("Invalid session. User address not found.");
        }
      } catch (error) {
        console.error("Error verifying session or user:", error);
        setMessage("Error verifying session or user.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserSession();
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!userAddress || !imageBase64) {
      setMessage("Error: Public address or image not found.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/devUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicAddress: userAddress,
          tipo: 3,
          base64image: imageBase64,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Image updated successfully.");
      } else {
        setMessage(result.message || "Error updating image.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage("Error uploading image.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNftName("");
    setNftDescription("");
    setNftQuantidade(0);
    setNftPreco(0);
    setImageBase64("");
    setGameMetadata({});
    setMetadataKey("");
    setMetadataValue("");
  };

  const handleActivateDevUser = async () => {
    try {
      setLoading(true);
      setMessage("Preparing transaction to activate your account...");
      if (!userAddress) {
        setMessage("Error: Public address not found.");
        setLoading(false);
        return;
      }
      const amount = "10000000";

      const { response } = await sdk.async.signAndSubmitAndWait({
        TransactionType: "Payment",
        Account: userAddress,
        Amount: amount,
        Destination: destinationAddress,
      });

      if (response.data.meta.isSuccess === true) {
        setMessage("Payment successful. Activating your account...");

        const activateRes = await fetch("/api/devUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicAddress: userAddress,
            tipo: 1,
          }),
        });

        const activateData = await activateRes.json();
        if (activateRes.ok) {
          setActivated(true);
          setMessage("Your account has been successfully activated!");
        } else {
          setMessage(`Error activating account: ${activateData.message}`);
        }
      } else {
        setMessage("Failed to send payment transaction.");
      }
    } catch (error) {
      console.error("Error activating account:", error);
      setMessage("Error processing request.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (!newPassword) {
        setMessage("Please enter a new password.");
        return;
      }

      setLoading(true);
      const updatePasswordRes = await fetch("/api/devUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicAddress: userAddress,
          tipo: 2,
          password: newPassword,
        }),
      });

      const result = await updatePasswordRes.json();
      if (updatePasswordRes.ok) {
        setMessage("Password updated successfully.");
      } else {
        setMessage(result.message || "Error updating password.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage("Error updating password.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetadata = () => {
    if (metadataKey && metadataValue) {
      setGameMetadata((prevMetadata) => ({
        ...prevMetadata,
        [metadataKey]: metadataValue,
      }));
      setMetadataKey("");
      setMetadataValue("");
    } else {
      setMessage("Please fill in both the key and value for the metadata.");
    }
  };

  const handleCreateNFT = async () => {
    if (!userAddress || !imageBase64 || !nftName || !nftDescription || nftQuantidade <= 0 || nftPreco <= 0) {
      setMessage("Please fill in all fields correctly.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/createNftGameShop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64image: imageBase64,
          name: nftName,
          description: nftDescription,
          gameMetadata,
          gameAddress: userAddress,
          quantidade: nftQuantidade,
          preco: nftPreco,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("NFT created successfully.");
        resetForm();
      } else {
        setMessage(result.message || "Error creating NFT.");
      }
    } catch (error) {
      console.error("Error creating NFT:", error);
      setMessage("Error creating NFT.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-200 to-gray-400">
        <h1 className="text-2xl text-gray-800 animate-pulse">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 p-8">
      <div className="max-w-2xl w-full bg-white shadow-xl rounded-lg p-8 space-y-6">
        <h1 className="text-3xl font-extrabold text-center text-gray-800">Dev Options</h1>

        {message && <p className="text-red-600 text-center font-medium">{message}</p>}

        {!userAddress ? (
          <p className="text-center text-gray-600">You need to be logged in to access Dev Options.</p>
        ) : activated === null ? (
          <p className="text-center text-gray-600">Checking user status...</p>
        ) : activated === false ? (
          <div className="flex flex-col items-center">
            <p className="mb-4 text-gray-700">Your account is not yet activated for Dev Options.</p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200"
              onClick={handleActivateDevUser}
            >
              Activate Dev Account
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-8">
            <p className="text-gray-700 text-lg font-medium">Dev Options activated.</p>

            <div className="w-full space-y-4">
            <h1 className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700 font-semibold ">Create NFT items for gameshop</h1>
              <input
                type="text"
                value={nftName}
                onChange={(e) => setNftName(e.target.value)}
                placeholder="NFT Name"
                className="border border-gray-300 rounded-lg w-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <textarea
                value={nftDescription}
                onChange={(e) => setNftDescription(e.target.value)}
                placeholder="NFT Description"
                className="border border-gray-300 rounded-lg w-full py-2 px-4 h-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
              ></textarea>

              <div>
                <label className="block mb-1 text-gray-700 font-semibold">Quantity</label>
                <input
                  type="number"
                  value={nftQuantidade}
                  onChange={(e) => setNftQuantidade(Number(e.target.value))}
                  placeholder="Quantity"
                  className="border border-gray-300 rounded-lg w-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700 font-semibold">Price</label>
                <input
                  type="number"
                  value={nftPreco}
                  onChange={(e) => setNftPreco(Number(e.target.value))}
                  placeholder="Price"
                  step="0.01"
                  className="border border-gray-300 rounded-lg w-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700 font-semibold">Image Upload:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                />
              </div>

              <div className="w-full space-y-2">
                <label className="block mb-1 text-gray-700 font-semibold">Game Metadata</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={metadataKey}
                    onChange={(e) => setMetadataKey(e.target.value)}
                    placeholder="Key"
                    className="border border-gray-300 rounded-lg py-2 px-3 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    value={metadataValue}
                    onChange={(e) => setMetadataValue(e.target.value)}
                    placeholder="Value"
                    className="border border-gray-300 rounded-lg py-2 px-3 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddMetadata}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg mt-2 w-full transition duration-200"
                >
                  Add Metadata
                </button>
                {Object.keys(gameMetadata).length > 0 && (
                  <div className="w-full mt-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-bold text-gray-800 mb-2">Added Metadata:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {Object.entries(gameMetadata).map(([key, value]) => (
                        <li key={key}>
                          <strong>{key}</strong>: {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg w-full shadow-md transition duration-200"
                onClick={handleCreateNFT}
              >
                Create NFT
              </button>
            </div>

            <div className="w-full space-y-4">
            <h1 className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700 font-semibold ">Change password</h1>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="border border-gray-300 rounded-lg w-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg w-full shadow-md transition duration-200"
                onClick={handleUpdatePassword}
              >
                Update Password
              </button>

              <div className="mt-6">
                <h1 className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700 font-semibold "></h1>
                <label className="block mb-2 font-bold text-gray-700">Change game image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                />
                <button
                  className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg w-full mt-4 transition duration-200"
                  onClick={handleImageUpload}
                >
                  Update Image
                </button>
              </div>

              {userAddress && destinationAddress && (
                <BuyWeb3Coin address={userAddress} destinationAddress={destinationAddress} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevOptions;
