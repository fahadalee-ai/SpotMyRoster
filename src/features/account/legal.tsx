import { Page } from "@/components/athlete/ui";

export function LegalScreen({ doc }: { doc: string }) {
  const terms = doc === "terms";
  if (!terms && doc !== "privacy") {
    return <Page title="Notice">That page is not part of this sample.</Page>;
  }
  return (
    <Page title={terms ? "Terms" : "Privacy notice"}>
      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          Official {terms ? "terms and conditions" : "privacy policy"} text has not been provided. Do not treat this screen as a legal agreement or as legal advice.
        </p>
        <p>
          SpotMyRoster can be reached at greg@spotmyroster.com or +1 220-246-7172. The public website at spotmyroster.com is a coming-soon page.
        </p>
        {!terms && (
          <>
            <p>In this sample, profile visibility, messaging, blocks, and reports are stored only on the device. There is no live roster service attached.</p>
            <p>
              Athletes may be minors. Profiles for athletes under 13 keep messaging off and do not use the full coach view. Whether that matches COPPA or other age rules has to be confirmed by the client’s counsel before launch.
            </p>
          </>
        )}
        {terms && <p>Creating an account in this sample only saves a local record. It does not create a contract with SpotMyRoster.</p>}
      </div>
    </Page>
  );
}
