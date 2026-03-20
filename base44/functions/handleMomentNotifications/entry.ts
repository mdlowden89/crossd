import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { momentId, userId } = await req.json();

    if (!momentId || !userId) {
      return Response.json({ error: 'Missing momentId or userId' }, { status: 400 });
    }

    // Get the moment
    const moment = await base44.asServiceRole.entities.Moment.filter({ id: momentId });
    if (!moment || moment.length === 0) {
      return Response.json({ error: 'Moment not found' }, { status: 404 });
    }

    // Find all crossings where this moment was involved
    const crossings = await base44.asServiceRole.entities.Crossing.filter({
      $or: [
        { moment_a_id: momentId },
        { moment_b_id: momentId }
      ]
    });

    if (!crossings || crossings.length === 0) {
      return Response.json({ message: 'No crossings found' }, { status: 200 });
    }

    // For each crossing, send notification to the other user
    for (const crossing of crossings) {
      const otherUserId = crossing.user_a_id === userId ? crossing.user_b_id : crossing.user_a_id;
      
      // Get the other user's profile to send notification
      const otherProfile = await base44.asServiceRole.entities.Profile.filter({ user_id: otherUserId });
      if (!otherProfile || otherProfile.length === 0) continue;

      const currentProfile = await base44.asServiceRole.entities.Profile.filter({ user_id: userId });
      if (!currentProfile || currentProfile.length === 0) continue;

      // Create notification for the other user
      await base44.asServiceRole.entities.Notification.create({
        user_id: otherProfile[0].id,
        type: 'new_crossing',
        title: 'You crossed paths!',
        body: `You and ${currentProfile[0].display_name} were at the same place`,
        data: {
          crossing_id: crossing.id,
          user_id: currentProfile[0].id,
          display_name: currentProfile[0].display_name
        },
        read: false,
        sent: false
      });
    }

    return Response.json({ success: true, crossings_notified: crossings.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});