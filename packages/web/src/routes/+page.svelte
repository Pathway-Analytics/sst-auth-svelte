<!-- packages/web/src/routes/+page.svelte -->
<script lang="ts">
  import { subjects } from '../../../functions/src/auth/subjects';
  const { data } = $props<{ data: { subject: typeof subjects.user } }>();
</script>

<h1>Welcome</h1>
{#if data?.subject}
  <p>Logged in as {data.subject.name} ({data.subject.email})</p>
  <pre>{JSON.stringify(data.subject, null, 2)}</pre>
  <a href="/logout">Logout</a>
{:else}
  <a href="/login">Login</a>
{/if}