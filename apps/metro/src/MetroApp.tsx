import { HostApp } from "@central/host";
import { SocialHome } from "./social/SocialHome";
import { SocialProfile } from "./social/SocialProfile";

export function MetroApp() {
  return (
    <HostApp
      shellId="metro"
      home={SocialHome}
      extraNav={[{ id: "profile", label: "Profile", panel: <SocialProfile /> }]}
    />
  );
}
