# **App Name**: BankSafe

## Core Features:

- Resource Table Display: Display tables (Available, Max, Allocation, Need) showing resource allocation status. Each table updates in real time.
- Loan Request Submission: Customers submit loan requests through a form. The form validates that all required fields are completed.
- Safety Algorithm: Assess loan requests based on the Banker’s Algorithm: Request_i <= Need_i ? Yes -> Check Available; Available >= Request_i ? Yes -> Pretend to allocate and check safety; Safe -> grant loan; Unsafe -> deny; No -> deny; No -> error (asking more than max).
- Safe Sequence Visualization: Visually represent a safe sequence of resource allocation (if available) after each loan approval.
- Alerting System: Display alerts for unsafe loan requests or system states to prevent deadlocks.

## Style Guidelines:

- Primary color: Dark blue (#34495E) for stability and trust, reminiscent of traditional banking colors.
- Background color: Light gray (#ECF0F1), offering a clean and unobtrusive backdrop for detailed data displays.
- Accent color: Teal (#1ABC9C) to highlight important actions, alerts, and real-time updates.
- Body and headline font: 'Inter', a sans-serif font, for a modern, machined, objective feel that provides readability across all screen sizes.
- Use clean, professional icons to represent resources, processes, and status indicators.
- Divide the layout into clear sections for resource tables, request forms, and status displays. Use grid systems to align elements, ensure responsiveness and a balance of information.