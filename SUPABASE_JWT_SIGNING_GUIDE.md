 Here is a playbook to transform your old anon and service_role keys to the new JWT Signing Keys for your Next.js application, based on best practices from Supabase.

### **The Playbook for JWT Signing Key Transformation**

This guide will walk you through migrating your Next.js application from legacy symmetric JWTs to modern, more secure asymmetric JWT Signing Keys. This enhances security and significantly boosts performance by eliminating unnecessary server roundtrips.

#### **The "Why": Understanding the Risk of Old Keys**

Previously, Supabase used symmetric keys, where a single shared `JWT secret` was used to both create and verify tokens. This model presented several challenges at scale:

*   **Performance Bottlenecks**: Verifying a session required a server call (`supabase.auth.getUser()`) to the Auth server, adding network latency.
*   **Fragility**: Server-side applications, especially those on the edge, had a dependency on the Auth server being online.
*   **Security Concerns**: If the shared secret were ever leaked, attackers could forge tokens and bypass Row-Level Security.

The new asymmetric key model uses a private key (known only to Supabase) to sign tokens and a public key to verify them. This allows you to securely verify tokens anywhere in your application without relying on the Auth server.

---

### **Migration Steps**

Follow these steps for a zero-downtime migration for your Next.js application.

#### **Phase 1: Migrating to the New JWT System**

**1. Enable JWT Signing Keys in Supabase**

First, you need to activate the new system within your Supabase project.

*   Navigate to your Supabase project dashboard.
*   Go to the **JWT Keys** section (you can find it under "Project Settings" -> "API" -> "JWT Keys" or by searching).
*   In the "JWT Signing Keys" tab, you will see an option to migrate. Click **"Migrate JWT secret"**.

This initial step prepares your project for asymmetric JWTs by migrating your existing secret into the new signing key system. Your application will continue to function without any changes at this point.

**2. Refactor Your Next.js Code**

To take advantage of the performance benefits, you need to update how you verify user sessions in your Next.js application.

*   **Change the Verification Function**: The key change is to replace `supabase.auth.getUser()` with the faster `supabase.auth.getClaims()`. The `getClaims()` function uses the Web Crypto API to verify tokens directly on the edge using the cached public key.

    **Before:**
    ```javascript
    // This makes a call to the Supabase Auth server every time
    const { data, error } = await supabase.auth.getUser();
    ```

    **After:**
    ```javascript
    // This verifies the token directly using the public key
    const { data, error } = await supabase.auth.getClaims();
    ```

*   **Update User Object Reference**: The returned object structure is slightly different. Instead of `data.user`, you will now have `data.claims`. Make sure to update any references in your code.

This refactoring is safe to deploy now, as the new system can handle both old and new tokens during the transition.

**3. Rotate Keys to Enable Asymmetric Signing**

Now, you'll activate the new asymmetric key.

*   Return to the **JWT Keys** page in your Supabase dashboard.
*   Click the **"Rotate keys"** button.

This action tells Supabase Auth to start issuing all *new* JWTs signed with the new, asymmetric private key. Importantly, any existing, non-expired JWTs signed with the old key will remain valid and accepted until they expire, ensuring a seamless experience for your users.

**4. Revoke the Old JWT Secret**

After you have verified that your application is working as expected with the new keys, you can complete the migration.

*   On the **JWT Keys** page, you can now revoke the legacy JWT secret.
*   From this point forward, only JWTs signed with the new asymmetric key will be accepted.

#### **Phase 2: Migrating API Keys**

The legacy `anon` and `service_role` keys are themselves long-lived JWTs. Revoking the old secret will invalidate them. Therefore, you should switch to the new publishable and secret keys.

1.  **Switch to New API Keys**:
    *   Instead of the `anon` key, use the new **publishable key**.
    *   Instead of the `service_role` key, use the new **secret keys**.

2.  **Update Environment Variables**: Replace the legacy keys in your Next.js application's environment variables (`.env.local`) with the new corresponding keys from your Supabase project's API settings.

#### **Important Timelines**

Supabase has outlined a timeline for these features:

*   **October 1, 2025**: All new projects will use asymmetric JWTs by default. Existing projects will be automatically migrated to the new JWT signing keys system, but no secrets will be changed without action.
*   **November 1, 2025**: Periodic reminders will be sent to start using the new publishable/secret API keys.
*   **Late 2026 (TBC)**: All projects will be required to move away from `anon` and `service_role` keys.

By following this playbook, you will have successfully migrated your Next.js application to a more secure, scalable, and performant authentication system.
