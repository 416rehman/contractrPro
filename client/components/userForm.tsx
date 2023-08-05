"use client";
import {
  changeAndPersistAvatarUrl,
  changeAndPersistName,
  changeEmail,
  changePhone,
  useUserStore
} from "@/services/user";
import { Card, CardBody } from "@nextui-org/card";
import { IconAt, IconCheck, IconMail, IconPencil, IconPencilOff, IconPhone, IconPhoto } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Input } from "@nextui-org/react";
import { Tooltip } from "@nextui-org/tooltip";
import { Button } from "@nextui-org/button";
import { useToastsStore } from "@/services/toast";

/**
 * The user form allows the user to edit their profile information. Uses the user/me/ routes
 */
export default function UserForm() {
  const user = useUserStore(state => state.user);
  const addToast = useToastsStore(state => state.addToast);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  useEffect(() => {
    setNewName(user?.name || "");
  }, [user]);
  const submitName = () => {
    setIsEditingName(false);
    changeAndPersistName(newName).then(() => {
      addToast({
        id: "userName",
        title: "Name changed",
        message: "Your name has been successfully changed!",
        type: "success"
      });
    }).catch((err) => {
      addToast({
        id: "userName",
        title: "Error",
        message: err.message || err || "An error occurred while changing your name",
        type: "error"
      });
    });
  };

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  useEffect(() => {
    setNewEmail(user?.email || "");
  }, [user]);
  const submitEmail = () => {
    setIsEditingEmail(false);
    changeEmail(newEmail).then((res) => {
      addToast({
        id: "userEmail",
        title: "Success",
        message: res,
        type: "success"
      });
    }).catch((err) => {
      addToast({
        id: "userEmail",
        title: "Error",
        message: err.message || err || "An error occurred while changing your email",
        type: "error"
      });
    });
  };

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const [newPhoneCountry, setNewPhoneCountry] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  useEffect(() => {
    setNewPhoneCountry(user?.phoneCountry || "");
    setNewPhoneNumber(user?.phoneNumber || "");
  }, [user]);
  const submitPhone = () => {
    setIsEditingPhone(false);
    changePhone(newPhoneCountry, newPhoneNumber).then((res) => {
      addToast({
        id: "userPhone",
        title: "Success",
        message: res,
        type: "success"
      });
    }).catch((err) => {
      addToast({
        id: "userPhone",
        title: "Error",
        message: err.message || err || "An error occurred while changing your phone",
        type: "error"
      });
    });
  };

  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [newAvatar, setNewAvatar] = useState("");
  useEffect(() => {
    setNewAvatar(user?.avatarUrl || "");
  }, [user]);
  const submitAvatar = () => {
    setIsEditingAvatar(false);
    changeAndPersistAvatarUrl(newAvatar).then(() => {
      addToast({
        id: "userAvatar",
        title: "Avatar changed",
        message: "Your avatar has been successfully changed!",
        type: "success"
      });
    }).catch((err) => {
      addToast({
        id: "userAvatar",
        title: "Error",
        message: err.message || err || "An error occurred while changing your avatar",
        type: "error"
      });
    });
  };

  return (
    <Card
      isBlurred
      className="border-none"
      shadow="sm"
    >
      <CardBody className={"w-full flex flex-col gap-5"}>
        <div className="flex flex-row flex-wrap justify-center gap-2 items-start w-full">
          <div>
            <img
              height={200}
              width={200}
              alt={(user?.name || "user") + "'s profile picture"}
              className="w-full object-cover h-[140px] rounded-lg"
              src={newAvatar || "/defaultImages/userDefault.png"}
              onError={(e) => {
                const targetElement = e.target as HTMLElement;
                targetElement.setAttribute("src", "/defaultImages/userDefault.png");
              }}
            />
          </div>
          <div className="flex flex-col gap-5 flex-grow">
            <div className={"flex flex-col gap-1 items-start"}>
              <div className="flex flex-row justify-between items-center w-full">
                {isEditingName ? (
                  <div className="flex flex-row justify-between items-center gap-1">
                    <Input
                      variant={"underlined"}
                      placeholder={"Name"}
                      value={newName}
                      className="w-full"
                      onChange={(e) => setNewName(e.target.value)}
                    />
                    <Button isIconOnly={true} variant={"flat"} color={"primary"} onPress={submitName}>
                      <IconCheck className="text-default-600" size={18} />
                    </Button>
                  </div>
                ) : (
                  <p className="text-large font-medium mt-2 capitalize">{user?.name}</p>
                )}
                <Button isIconOnly={true} onPress={() => setIsEditingName(!isEditingName)} variant={"light"}
                        size={"sm"}>
                  {isEditingName ? (
                    <IconPencilOff className="text-default-600" size={18} />
                  ) : (
                    <IconPencil className="text-default-600" size={18} />
                  )}
                </Button>
              </div>
              <div className="text-default-600 text-sm flex justify-center items-center flex-row gap-1">
              <span>
              <IconAt className="text-default-400" size={18} />
              </span>
                <span className="text-default-500 font-medium">
              {user?.username}
              </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row justify-between items-center">
                <p className="font-semibold text-foreground/90 flex flex-row gap-1 items-center"><IconMail
                  className={"text-default-500"} size={18} />Email</p>
                <Button isIconOnly={true} onPress={() => setIsEditingEmail(!isEditingEmail)} variant={"light"}
                        size={"sm"}>
                  {isEditingEmail ? (
                    <IconPencilOff className="text-default-600" size={18} />
                  ) : (
                    <IconPencil className="text-default-600" size={18} />
                  )}
                </Button>
              </div>
              {isEditingEmail ? (
                <div className="flex flex-row justify-between items-center">
                  <Input placeholder={"Email"} value={newEmail} className="w-full" variant={"underlined"}
                         onChange={(e) => setNewEmail(e.target.value)} />
                  <Button isIconOnly={true} variant={"flat"} color={"primary"} onPress={submitEmail}>
                    <IconCheck className="text-default-600" size={18} />
                  </Button>
                </div>
              ) : (
                isEmailVisible ? (
                  <p className="text-default-500">{user?.email}</p>
                ) : (
                  <Tooltip content={"Click to show"}>
                    <p className="text-default-500 cursor-pointer" onClick={() => setIsEmailVisible(true)}>
                      {user?.email[0]}***@{user?.email.split("@")[1]}
                    </p>
                  </Tooltip>
                )
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row justify-between items-center">
                <p className="font-semibold text-foreground/90 flex flex-row gap-1 items-center"><IconPhone
                  className={"text-default-500"} size={18} />Phone</p>
                <Button isIconOnly={true} onPress={() => setIsEditingPhone(!isEditingPhone)} variant={"light"}
                        size={"sm"}>
                  {isEditingPhone ? (
                    <IconPencilOff className="text-default-600" size={18} />
                  ) : (
                    <IconPencil className="text-default-600" size={18} />
                  )}
                </Button>
              </div>
              {isEditingPhone ? (
                <div className="flex flex-row justify-between items-center">
                  <Input placeholder={"Country Code"} value={newPhoneCountry} className="w-full" variant={"underlined"}
                         type={"number"}
                         onChange={(e) => setNewPhoneCountry(e.target.value)} />
                  <Input placeholder={"Phone Number"} value={newPhoneNumber} className="w-full" variant={"underlined"}
                         type={"number"}
                         onChange={(e) => setNewPhoneNumber(e.target.value)} />
                  <Button isIconOnly={true} variant={"flat"} color={"primary"} onPress={() => submitPhone()}>
                    <IconCheck className="text-default-600" size={18} />
                  </Button>
                </div>
              ) : (
                isPhoneVisible ? (
                  <p className="text-default-500">{(user?.phoneCountry && user?.phoneNumber) || "No phone number"}</p>
                ) : (
                  <Tooltip content={"Click to show"}>
                    <p className="text-default-500 cursor-pointer" onClick={() => setIsPhoneVisible(true)}>
                      {(user?.phoneCountry && user?.phoneNumber) ? (
                        user?.phoneCountry[0] + "***" + user?.phoneNumber?.slice(-4)
                      ) : (
                        "No phone number"
                      )}
                    </p>
                  </Tooltip>
                )
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row justify-between items-center">
                <p className="font-semibold text-foreground/90 flex flex-row gap-1 items-center"><IconPhoto
                  className={"text-default-500"} size={18} />Avatar</p>
                <Button isIconOnly={true} onPress={() => setIsEditingAvatar(!isEditingAvatar)} variant={"light"}
                        size={"sm"}>
                  {isEditingAvatar ? (
                    <IconPencilOff className="text-default-600" size={18} />
                  ) : (
                    <IconPencil className="text-default-600" size={18} />
                  )}
                </Button>
              </div>
              {isEditingAvatar ? (
                <div className="flex flex-row justify-between items-center">
                  <Input placeholder={"Avatar"} value={newAvatar} className="w-full" variant={"underlined"}
                         onChange={(e) => setNewAvatar(e.target.value)} />
                  <Button isIconOnly={true} variant={"flat"} color={"primary"} onPress={() => submitAvatar()}>
                    <IconCheck className="text-default-600" size={18} />
                  </Button>
                </div>
              ) : (
                <p className="text-default-500 break-all">
                  {user?.avatarUrl ? (
                    <a href={user?.avatarUrl} target="_blank" rel="noreferrer" className="break-words">
                      {user?.avatarUrl}
                    </a>
                  ) : (
                    "No avatar"
                  )}
                </p>
              )}
            </div>
          </div>
          <div>

          </div>

        </div>
      </CardBody>
    </Card>
  );
}