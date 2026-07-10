using System.Collections.Concurrent;
using System.Threading.Channels;

namespace Traceability.Sse;

/// <summary>
/// A tiny Server-Sent-Events fan-out hub. Each connected dashboard gets a bounded,
/// drop-oldest channel; publishing fans a message to every client. SSE (not WebSocket)
/// on purpose: one-directional (collector → browser) is all the dashboard needs, and it
/// is a plain streaming HTTP response — trim/AOT-safe with no extra middleware.
/// </summary>
public sealed class Broadcaster
{
    private readonly ConcurrentDictionary<Guid, Channel<string>> _clients = new();

    public int ClientCount => _clients.Count;

    /// <summary>Register a client; returns its id and the reader to stream from.</summary>
    public (Guid Id, ChannelReader<string> Reader) Subscribe()
    {
        Channel<string> channel = Channel.CreateBounded<string>(
            new BoundedChannelOptions(1_000) { FullMode = BoundedChannelFullMode.DropOldest });
        Guid id = Guid.NewGuid();
        _clients[id] = channel;
        return (id, channel.Reader);
    }

    public void Unsubscribe(Guid id)
    {
        if (_clients.TryRemove(id, out Channel<string>? channel))
            channel.Writer.TryComplete();
    }

    /// <summary>Fan a pre-serialized SSE data payload to every connected client.</summary>
    public void Publish(string message)
    {
        foreach (Channel<string> channel in _clients.Values)
            channel.Writer.TryWrite(message); // bounded + drop-oldest: never blocks the ingest path
    }
}
